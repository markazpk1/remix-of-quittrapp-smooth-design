const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get all profiles (admin only)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile verification status (admin only)
router.put('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ verified: verified || true })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Profile verification updated', profile: data });
  } catch (error) {
    console.error('Update profile verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
