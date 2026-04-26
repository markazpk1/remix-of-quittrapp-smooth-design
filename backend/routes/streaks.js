const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get streaks for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Streaks not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get streaks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update streaks
router.put('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { prayer_streak, quran_streak, library_streak } = req.body;

    const { data, error } = await supabase
      .from('streaks')
      .upsert({
        user_id: userId,
        prayer_streak: prayer_streak || 0,
        quran_streak: quran_streak || 0,
        library_streak: library_streak || 0,
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Update streaks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
