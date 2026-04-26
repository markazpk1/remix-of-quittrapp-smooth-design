const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (users with activity in last 24 hours)
    const { count: activeUsers } = await supabase
      .from('daily_goals')
      .select('*', { count: 'exact', head: true })
      .gte('date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Get total threads
    const { count: totalThreads } = await supabase
      .from('threads')
      .select('*', { count: 'exact', head: true });

    // Get pending reports
    const { count: pendingReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    res.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalThreads: totalThreads || 0,
      pendingReports: pendingReports || 0,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user growth data
router.get('/user-growth', async (req, res) => {
  try {
    // Get users created in the last 12 months
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Group by month
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    data.forEach(user => {
      const date = new Date(user.created_at);
      const monthKey = months[date.getMonth()];
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey]++;
    });

    const chartData = months.map(month => ({
      name: month,
      users: monthlyData[month] || 0,
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Get user growth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top content
router.get('/top-content', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('library_content')
      .select('id, title, content_type, view_count')
      .order('view_count', { ascending: false })
      .limit(5);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const topContent = data.map(item => ({
      title: item.title,
      type: item.content_type,
      views: item.view_count || 0,
      completion: Math.floor(Math.random() * 30) + 70, // Placeholder - would need actual completion tracking
    }));

    res.json(topContent);
  } catch (error) {
    console.error('Get top content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    // Get recent threads
    const { data: threads, error: threadsError } = await supabase
      .from('threads')
      .select('created_at, content, user_id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (threadsError) {
      return res.status(400).json({ error: threadsError.message });
    }

    // Get user names
    const userIds = [...new Set(threads.map(t => t.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    if (profilesError) {
      return res.status(400).json({ error: profilesError.message });
    }

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.id] = p.full_name || 'Unknown';
    });

    const activity = threads.map(t => ({
      user: profileMap[t.user_id] || 'Unknown',
      action: 'Created a post',
      time: `${Math.floor((Date.now() - new Date(t.created_at).getTime()) / 60000)} min ago`,
      avatar: (profileMap[t.user_id] || 'Unknown').substring(0, 2).toUpperCase(),
    }));

    res.json(activity);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending items
router.get('/pending-items', async (req, res) => {
  try {
    // Get pending reports
    const { count: reports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get unread notifications
    const { count: notifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    res.json([
      { label: 'Support tickets', count: reports || 0, icon: 'AlertTriangle', color: 'text-red-400' },
      { label: 'Flagged posts', count: 0, icon: 'MessageSquare', color: 'text-yellow-400' },
      { label: 'Pending reviews', count: notifications || 0, icon: 'Clock', color: 'text-blue-400' },
      { label: 'Draft lessons', count: 0, icon: 'BookOpen', color: 'text-primary' },
    ]);
  } catch (error) {
    console.error('Get pending items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
