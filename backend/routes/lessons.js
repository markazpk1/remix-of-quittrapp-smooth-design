const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get lessons statistics
router.get('/stats', async (req, res) => {
  try {
    // Get library content count (lessons)
    const { count: lessonsCount } = await supabase
      .from('library_content')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'lesson');

    // Get audio content count
    const { count: audioCount } = await supabase
      .from('library_content')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'audio');

    // Get total views
    const { data: contentData } = await supabase
      .from('library_content')
      .select('view_count');

    const totalViews = contentData?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;

    res.json({
      lessons: lessonsCount || 0,
      audio: audioCount || 0,
      totalViews,
    });
  } catch (error) {
    console.error('Get lessons stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lessons
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('library_content')
      .select('id, title, content_type, view_count, created_at')
      .eq('content_type', 'lesson')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const lessons = data.map((item, index) => ({
      id: item.id,
      title: item.title,
      category: 'Islamic Studies',
      type: 'article',
      status: 'published',
      views: item.view_count || 0,
      duration: '10 min',
      order: index + 1,
    }));

    res.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get audio therapy tracks
router.get('/audio', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('library_content')
      .select('id, title, content_type, view_count, created_at')
      .eq('content_type', 'audio')
      .order('view_count', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const audioTracks = data.map((item) => ({
      id: item.id,
      name: item.title,
      category: 'Meditation',
      duration: '15 min',
      plays: item.view_count || 0,
      status: 'active',
    }));

    res.json(audioTracks);
  } catch (error) {
    console.error('Get audio tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get voice tracks (placeholder for now)
router.get('/voice', async (req, res) => {
  try {
    // For now, return empty voice tracks since we don't have a voice tracks table
    res.json([]);
  } catch (error) {
    console.error('Get voice tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
