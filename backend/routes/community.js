const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get community statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total threads/posts
    const { count: totalPosts } = await supabase
      .from('threads')
      .select('*', { count: 'exact', head: true });

    // Get unique users who posted
    const { data: threadsData } = await supabase
      .from('threads')
      .select('user_id');

    const uniqueUsers = new Set(threadsData?.map(t => t.user_id) || []);
    const activeUsers = uniqueUsers.size;

    // Get pending reports
    const { count: pendingReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get banned users (profiles with banned flag)
    const { count: bannedUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('banned', true);

    res.json({
      totalPosts: totalPosts || 0,
      activeUsers,
      pendingReports: pendingReports || 0,
      bannedUsers: bannedUsers || 0,
    });
  } catch (error) {
    console.error('Get community stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all posts/threads
router.get('/posts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('threads')
      .select('id, content, created_at, user_id, like_count, comment_count, flagged')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get user profiles for avatar/names
    const userIds = [...new Set(data.map(t => t.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, banned')
      .in('id', userIds);

    if (profilesError) {
      return res.status(400).json({ error: profilesError.message });
    }

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.id] = {
        name: p.full_name || 'Unknown',
        avatar: p.full_name ? p.full_name.substring(0, 2).toUpperCase() : 'UN',
        banned: p.banned || false,
      };
    });

    const posts = data.map(thread => {
      const profile = profileMap[thread.user_id] || { name: 'Unknown', avatar: 'UN', banned: false };
      return {
        id: thread.id,
        user: profile.name,
        avatar: profile.avatar,
        content: thread.content,
        likes: thread.like_count || 0,
        comments: thread.comment_count || 0,
        time: `${Math.floor((Date.now() - new Date(thread.created_at).getTime()) / (1000 * 60 * 60))}h ago`,
        status: profile.banned ? 'banned' : (thread.flagged ? 'flagged' : 'active'),
        reported: thread.flagged || false,
        userId: thread.user_id,
      };
    });

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reports
router.get('/reports', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('id, thread_id, reporter_id, reason, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get reporter names
    const reporterIds = [...new Set(data.map(r => r.reporter_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', reporterIds);

    if (profilesError) {
      return res.status(400).json({ error: profilesError.message });
    }

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.id] = p.full_name || 'Unknown';
    });

    const reports = data.map(report => ({
      id: report.id,
      postId: report.thread_id || 0,
      reporter: profileMap[report.reporter_id] || 'Unknown',
      reason: report.reason,
      status: report.status,
      time: `${Math.floor((Date.now() - new Date(report.created_at).getTime()) / (1000 * 60 * 60))}h ago`,
    }));

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
