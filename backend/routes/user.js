const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Middleware to verify user token (simplified for now)
const verifyUser = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token verification failed' });
  }
};

// Get user dashboard data
router.get('/dashboard', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    // Get current streak
    const { data: streak, error: streakError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Get today's daily goals
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyGoals, error: goalsError } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    // Get recent activity (threads, library progress)
    const { data: recentThreads, error: threadsError } = await supabase
      .from('threads')
      .select('content, created_at, post_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    const { data: libraryProgress, error: progressError } = await supabase
      .from('user_library_progress')
      .select(`
        progress_percentage,
        completed,
        updated_at,
        library_content!inner (
          title,
          content_type
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5);
    
    // Calculate mock data for charts
    const streakData = [
      { day: "Mon", score: 85 },
      { day: "Tue", score: 72 },
      { day: "Wed", score: 90 },
      { day: "Thu", score: 65 },
      { day: "Fri", score: 88 },
      { day: "Sat", score: 95 },
      { day: "Sun", score: 78 },
    ];
    
    const milestones = [
      { label: "1 Week Clean", achieved: true, date: "Feb 15", icon: "Star" },
      { label: "2 Weeks Clean", achieved: true, date: "Feb 22", icon: "Star" },
      { label: "1 Month Clean", achieved: false, date: "In 6 days", icon: "Trophy" },
      { label: "100 Lessons Done", achieved: false, date: "87/100", icon: "Zap" },
    ];
    
    const recentActivity = [
      ...(recentThreads || []).map(thread => ({
        text: `Posted in community: ${thread.content.substring(0, 50)}...`,
        time: formatTimeAgo(thread.created_at),
        type: "community"
      })),
      ...(libraryProgress || []).map(progress => ({
        text: `Progress in ${progress.library_content.title}: ${progress.progress_percentage}%`,
        time: formatTimeAgo(progress.updated_at),
        type: "library"
      }))
    ].slice(0, 5);
    
    res.json({
      profile: profile || {},
      streak: streak || { prayer_streak: 0, quran_streak: 0, library_streak: 0 },
      dailyGoals: dailyGoals || {
        prayers_completed: 0,
        quran_pages_read: 0,
        library_hours: 0,
        productivity_score: 0
      },
      streakData,
      milestones,
      recentActivity
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user progress data
router.get('/progress', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get streaks
    const { data: streaks, error: streakError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Get daily goals for the last month
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: monthlyGoals, error: goalsError } = await supabase
      .from('daily_goals')
      .select('date, productivity_score')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    // Get user library progress stats
    const { data: libraryStats, error: libraryError } = await supabase
      .from('user_library_progress')
      .select('completed, progress_percentage')
      .eq('user_id', userId);
    
    const completedLessons = libraryStats?.filter(p => p.completed).length || 0;
    const totalProgress = libraryStats?.reduce((sum, p) => sum + p.progress_percentage, 0) || 0;
    
    // Mock data for charts
    const monthlyData = [
      { week: "W1", clean: 7, cravings: 3 },
      { week: "W2", clean: 7, cravings: 2 },
      { week: "W3", clean: 6, cravings: 4 },
      { week: "W4", clean: 7, cravings: 1 },
    ];
    
    const moodData = [
      { day: "1", mood: 3 }, { day: "3", mood: 4 }, { day: "5", mood: 3 }, { day: "7", mood: 5 },
      { day: "9", mood: 4 }, { day: "11", mood: 6 }, { day: "13", mood: 5 }, { day: "14", mood: 7 },
    ];
    
    const achievements = [
      { title: "First Step", desc: "Started your journey", unlocked: true, icon: "🚀" },
      { title: "3 Day Warrior", desc: "3 days without relapse", unlocked: true, icon: "⚔️" },
      { title: "Week Champion", desc: "1 full week clean", unlocked: true, icon: "🏆" },
      { title: "2 Week Hero", desc: "14 days strong", unlocked: true, icon: "🦸" },
      { title: "Month Master", desc: "30 days clean", unlocked: false, icon: "👑" },
      { title: "Lesson Lover", desc: "Complete 50 lessons", unlocked: completedLessons >= 50, icon: "📚" },
      { title: "Community Star", desc: "Help 10 people", unlocked: false, icon: "⭐" },
      { title: "Sound Healer", desc: "100 min of sound therapy", unlocked: false, icon: "🎵" },
      { title: "Century Club", desc: "100 days clean", unlocked: false, icon: "💯" },
      { title: "AI Partner", desc: "50 AI conversations", unlocked: false, icon: "🤖" },
    ];
    
    const stats = [
      { label: "Current Streak", value: `${streaks?.prayer_streak || 0} days`, icon: "Flame", color: "text-orange-400 bg-orange-500/20" },
      { label: "Best Streak", value: `${Math.max(streaks?.prayer_streak || 0, streaks?.quran_streak || 0, streaks?.library_streak || 0)} days`, icon: "Trophy", color: "text-yellow-400 bg-yellow-500/20" },
      { label: "Total Clean Days", value: `${monthlyGoals?.length || 0} / 30`, icon: "Calendar", color: "text-primary bg-primary/20" },
      { label: "Cravings Resisted", value: "34", icon: "Target", color: "text-green-400 bg-green-500/20" },
      { label: "Avg Daily Score", value: `${Math.round(monthlyGoals?.reduce((sum, g) => sum + g.productivity_score, 0) / (monthlyGoals?.length || 1))}/100`, icon: "TrendingUp", color: "text-blue-400 bg-blue-500/20" },
      { label: "Time Saved", value: "42 hrs", icon: "Clock", color: "text-purple-400 bg-purple-500/20" },
    ];
    
    res.json({
      monthlyData,
      moodData,
      achievements,
      stats,
      streaks: streaks || {},
      completedLessons,
      totalProgress: Math.round(totalProgress / (libraryStats?.length || 1))
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user lessons data
router.get('/lessons', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get library content (lessons)
    const { data: lessons, error: lessonsError } = await supabase
      .from('library_content')
      .select(`
        *,
        library_categories!inner (
          name
        ),
        user_library_progress!left (
          progress_percentage,
          completed,
          last_position
        )
      `)
      .eq('content_type', 'lesson')
      .order('created_at', { ascending: true });
    
    // Transform data for frontend
    const transformedLessons = (lessons || []).map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      category: lesson.library_categories.name,
      duration: `${lesson.duration} min`,
      type: lesson.content_type,
      completed: lesson.user_library_progress?.completed || false,
      progress: lesson.user_library_progress?.progress_percentage || 0,
      locked: false // TODO: implement locking logic
    }));
    
    const completed = transformedLessons.filter(l => l.completed).length;
    const progress = (completed / transformedLessons.length) * 100;
    
    res.json({
      lessons: transformedLessons,
      completed,
      progress,
      categories: ["All", ...new Set(transformedLessons.map(l => l.category))]
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user sounds data
router.get('/sounds', verifyUser, async (req, res) => {
  try {
    // Get library content (sounds)
    const { data: sounds, error: soundsError } = await supabase
      .from('library_content')
      .select(`
        *,
        library_categories!inner (
          name
        )
      `)
      .in('content_type', ['audio_book', 'quran_recitation', 'prophetic_story', 'hadith', 'dua'])
      .order('created_at', { ascending: true });
    
    // Transform data for frontend
    const transformedSounds = (sounds || []).map(sound => ({
      id: sound.id,
      title: sound.title,
      duration: sound.duration ? `${Math.floor(sound.duration / 60)}:${(sound.duration % 60).toString().padStart(2, '0')}` : "∞",
      category: sound.library_categories.name,
      type: sound.content_type,
      audioUrl: sound.audio_url,
      narrator: sound.narrator,
      qari: sound.qari,
      favorite: false // TODO: implement favorites
    }));
    
    res.json({
      sounds: transformedSounds,
      categories: ["All", "Nature", "Focus", "Music", "Meditation", "Quran", "Stories", "Duas"]
    });
  } catch (error) {
    console.error('Get sounds error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user community data
router.get('/community', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get threads
    const { data: threads, error: threadsError } = await supabase
      .from('threads')
      .select(`
        *,
        profiles!inner (
          full_name
        ),
        thread_likes!left (
          id
        ),
        thread_comments!left (
          count
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);
    
    // Transform threads data
    const transformedThreads = (threads || []).map(thread => ({
      id: thread.id,
      content: thread.content,
      postType: thread.post_type,
      mediaUrl: thread.media_url,
      isAnonymous: thread.is_anonymous,
      authorName: thread.is_anonymous ? "Anonymous" : thread.profiles.full_name,
      authorId: thread.user_id,
      likes: thread.thread_likes?.length || 0,
      comments: thread.thread_comments?.length || 0,
      hasanatPoints: thread.hasanat_points,
      createdAt: thread.created_at,
      userLiked: thread.thread_likes?.some(like => like.user_id === userId) || false
    }));
    
    res.json({
      threads: transformedThreads
    });
  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile data
router.get('/profile', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    // Get user stats
    const { data: streaks, error: streakError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Get library progress stats
    const { data: libraryStats, error: libraryError } = await supabase
      .from('user_library_progress')
      .select('completed')
      .eq('user_id', userId);
    
    const completedContent = libraryStats?.filter(p => p.completed).length || 0;
    
    res.json({
      profile: profile || {},
      stats: {
        currentStreak: streaks?.prayer_streak || 0,
        totalContent: completedContent,
        joinDate: profile?.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user subscription data
router.get('/subscription', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // TODO: Implement subscription logic
    // For now, return mock data
    res.json({
      plan: "free",
      status: "active",
      features: [
        "Basic lessons",
        "Community access",
        "Daily goals tracking"
      ],
      upgradeOptions: [
        {
          name: "Premium",
          price: "$4.99/month",
          features: [
            "All lessons unlocked",
            "Advanced analytics",
            "Priority support",
            "Ad-free experience"
          ]
        }
      ]
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user settings data
router.get('/settings', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile for settings
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    res.json({
      profile: profile || {},
      notifications: {
        email: true,
        push: true,
        dailyReminders: true,
        streakReminders: true
      },
      privacy: {
        profileVisible: true,
        showStreaks: true,
        anonymousPosting: false
      },
      preferences: {
        theme: "dark",
        language: "english",
        timezone: "UTC"
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to format time ago
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return "Just now";
}

module.exports = router;
