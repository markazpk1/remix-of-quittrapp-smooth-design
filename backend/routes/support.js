const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get support ticket statistics
router.get('/stats', async (req, res) => {
  try {
    // Since we don't have support ticket tables yet, return empty stats
    // When support system is implemented, this will query tickets table
    res.json({
      open: 0,
      inProgress: 0,
      resolved: 0,
      avgResponseTime: "0h",
    });
  } catch (error) {
    console.error('Get support stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get support tickets
router.get('/tickets', async (req, res) => {
  try {
    // Return empty array since no support tickets exist in database yet
    // When support system is implemented, this will query a tickets table
    res.json([]);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
