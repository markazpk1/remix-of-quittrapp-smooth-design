const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get services statistics
router.get('/stats', async (req, res) => {
  try {
    // Get library content count
    const { count: libraryCount } = await supabase
      .from('library_content')
      .select('*', { count: 'exact', head: true });

    // Get threads count
    const { count: threadsCount } = await supabase
      .from('threads')
      .select('*', { count: 'exact', head: true });

    // Get active users (users with daily goals today)
    const { count: activeUsers } = await supabase
      .from('daily_goals')
      .select('*', { count: 'exact', head: true })
      .eq('date', new Date().toISOString().split('T')[0]);

    // Get pomodoro sessions count
    const { count: pomodoroCount } = await supabase
      .from('pomodoro_sessions')
      .select('*', { count: 'exact', head: true });

    res.json({
      library: libraryCount || 0,
      threads: threadsCount || 0,
      activeUsers: activeUsers || 0,
      pomodoro: pomodoroCount || 0,
    });
  } catch (error) {
    console.error('Get services stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get library content
router.get('/library', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('library_content')
      .select('id, title, content_type, view_count')
      .order('view_count', { ascending: false })
      .limit(10);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Get library content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent threads
router.get('/threads', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('threads')
      .select('id, content, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
