const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get role statistics
router.get('/stats', async (req, res) => {
  try {
    // Get admin count
    const { count: adminCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true);

    // Get user count
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verified', false);

    res.json({
      adminCount: adminCount || 0,
      userCount: userCount || 0,
      totalUsers: (adminCount || 0) + (userCount || 0),
    });
  } catch (error) {
    console.error('Get role stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get users by role
router.get('/users/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const isAdmin = role === 'admin';

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, verified, created_at')
      .eq('verified', isAdmin)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
