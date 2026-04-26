const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get daily goals for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    let query = supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId);

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get daily goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update daily goals
router.post('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, prayers_completed, quran_pages_read, library_hours, custom_habits, productivity_score } = req.body;

    const { data, error } = await supabase
      .from('daily_goals')
      .upsert({
        user_id: userId,
        date: date || new Date().toISOString().split('T')[0],
        prayers_completed: prayers_completed || 0,
        quran_pages_read: quran_pages_read || 0,
        library_hours: library_hours || 0,
        custom_habits: custom_habits || {},
        productivity_score: productivity_score || 0,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Create daily goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
