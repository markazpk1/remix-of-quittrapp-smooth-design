const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get subscription statistics
router.get('/stats', async (req, res) => {
  try {
    // Since we don't have subscription tables yet, return real user stats
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    res.json({
      mrr: 0, // No MRR until payment system is implemented
      totalSubscribers: totalUsers || 0,
      paidUsers: 0, // No paid users until payment system is implemented
      activePlans: 0, // No active plans until subscription system is implemented
    });
  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pricing plans
router.get('/plans', async (req, res) => {
  try {
    // Return empty array since no subscription plans exist in database yet
    // When subscription system is implemented, this will query a plans table
    res.json([]);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscribers
router.get('/subscribers', async (req, res) => {
  try {
    // Return empty array since no subscribers exist in database yet
    // When subscription system is implemented, this will join users with subscription data
    res.json([]);
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
