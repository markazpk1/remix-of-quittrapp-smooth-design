const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get community statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total threads/posts
    const { count: totalPosts, error: postsError } = await supabase
      .from('threads')
      .select('*', { count: 'exact', head: true });

    if (postsError) {
      console.error('Posts count error:', postsError);
    }

    // Get unique users who posted
    const { data: threadsData, error: threadsDataError } = await supabase
      .from('threads')
      .select('user_id');

    let activeUsers = 0;
    if (!threadsDataError && threadsData) {
      const uniqueUsers = new Set(threadsData.map(t => t.user_id));
      activeUsers = uniqueUsers.size;
    }

    // Get pending reports
    const { count: pendingReports, error: reportsError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (reportsError) {
      console.error('Reports count error:', reportsError);
    }

    // For banned users, we'll use 0 for now since the schema doesn't have a banned column
    const bannedUsers = 0;

    res.json({
      totalPosts: totalPosts || 0,
      activeUsers,
      pendingReports: pendingReports || 0,
      bannedUsers,
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
      .select('id, content, created_at, user_id, is_anonymous, post_type');

    if (error) {
      console.error('Posts query error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Get user profiles for avatar/names
    const userIds = [...new Set(data?.map(t => t.user_id) || [])];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Profiles query error:', profilesError);
      return res.status(400).json({ error: profilesError.message });
    }

    const profileMap = {};
    profiles?.forEach(p => {
      profileMap[p.id] = {
        name: p.full_name || 'Unknown',
        avatar: p.full_name ? p.full_name.substring(0, 2).toUpperCase() : 'UN',
      };
    });

    // Get like counts for each thread
    const threadIds = [...new Set(data?.map(t => t.id) || [])];
    const { data: likesData, error: likesError } = await supabase
      .from('thread_likes')
      .select('thread_id')
      .in('thread_id', threadIds);

    const likeCountMap = {};
    likesData?.forEach(like => {
      likeCountMap[like.thread_id] = (likeCountMap[like.thread_id] || 0) + 1;
    });

    // Get comment counts for each thread
    const { data: commentsData, error: commentsError } = await supabase
      .from('thread_comments')
      .select('thread_id')
      .in('thread_id', threadIds);

    const commentCountMap = {};
    commentsData?.forEach(comment => {
      commentCountMap[comment.thread_id] = (commentCountMap[comment.thread_id] || 0) + 1;
    });

    const posts = data?.map(thread => {
      const profile = profileMap[thread.user_id] || { name: 'Unknown', avatar: 'UN' };
      return {
        id: thread.id,
        user: thread.is_anonymous ? 'Anonymous' : profile.name,
        avatar: thread.is_anonymous ? 'AN' : profile.avatar,
        content: thread.content,
        likes: likeCountMap[thread.id] || 0,
        comments: commentCountMap[thread.id] || 0,
        time: `${Math.floor((Date.now() - new Date(thread.created_at).getTime()) / (1000 * 60 * 60))}h ago`,
        status: 'active',
        reported: false,
        userId: thread.user_id,
      };
    }) || [];

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
      .select('id, content_id, reporter_id, reason, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Reports query error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Get reporter names
    const reporterIds = [...new Set(data?.map(r => r.reporter_id) || [])];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', reporterIds);

    if (profilesError) {
      console.error('Reporter profiles query error:', profilesError);
      return res.status(400).json({ error: profilesError.message });
    }

    const profileMap = {};
    profiles?.forEach(p => {
      profileMap[p.id] = p.full_name || 'Unknown';
    });

    const reports = data?.map(report => ({
      id: report.id,
      postId: report.content_id || '0',
      reporter: profileMap[report.reporter_id] || 'Unknown',
      reason: report.reason,
      status: report.status,
      time: `${Math.floor((Date.now() - new Date(report.created_at).getTime()) / (1000 * 60 * 60))}h ago`,
    })) || [];

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
