const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get KPI metrics
router.get('/kpis', async (req, res) => {
  try {
    // Get total users from profiles table
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (users with daily goals in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: activeUsersData } = await supabase
      .from('daily_goals')
      .select('user_id')
      .gte('created_at', thirtyDaysAgo);

    const activeUsers = activeUsersData ? [...new Set(activeUsersData.map(u => u.user_id))].length : 0;

    // Calculate DAU/MAU ratio (using active users as proxy for both since we don't have proper tracking yet)
    const dauMauRatio = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    // Return KPIs with real data where available
    res.json([
      { label: "MRR", value: "$0", change: "+0%", up: true }, // No subscription system yet
      { label: "DAU / MAU", value: `${dauMauRatio}%`, change: "+0%", up: true },
      { label: "Churn Rate", value: "0%", change: "0%", up: false }, // No churn tracking yet
      { label: "ARPU", value: "$0.00", change: "+$0.00", up: true }, // No revenue yet
      { label: "LTV", value: "$0", change: "+$0", up: true }, // No LTV calculation yet
      { label: "CAC", value: "$0.00", change: "-$0.00", up: false }, // No acquisition costs tracked yet
    ]);
  } catch (error) {
    console.error('Get KPIs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user growth data
router.get('/user-growth', async (req, res) => {
  try {
    // Get user registration data from profiles table
    const { data: profiles } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (!profiles || profiles.length === 0) {
      // Return empty data if no users
      return res.json([
        { month: "Jan", users: 0, active: 0 },
        { month: "Feb", users: 0, active: 0 },
        { month: "Mar", users: 0, active: 0 },
        { month: "Apr", users: 0, active: 0 },
        { month: "May", users: 0, active: 0 },
        { month: "Jun", users: 0, active: 0 },
      ]);
    }

    // Group users by month
    const monthlyData = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    profiles.forEach(profile => {
      const date = new Date(profile.created_at);
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      const key = `${year}-${monthName}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = { total: 0, active: 0 };
      }
      monthlyData[key].total++;
    });

    // Convert to array format for chart
    const chartData = months.slice(-6).map(month => ({
      month,
      users: monthlyData[`2024-${month}`]?.total || 0,
      active: monthlyData[`2024-${month}`]?.total || 0, // Using total as active for now
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Get user growth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get revenue data (placeholder)
router.get('/revenue', async (req, res) => {
  try {
    // Return empty revenue data since no payment system yet
    res.json([
      { month: "Jul", revenue: 0, costs: 0 },
      { month: "Aug", revenue: 0, costs: 0 },
      { month: "Sep", revenue: 0, costs: 0 },
      { month: "Oct", revenue: 0, costs: 0 },
      { month: "Nov", revenue: 0, costs: 0 },
      { month: "Dec", revenue: 0, costs: 0 },
      { month: "Jan", revenue: 0, costs: 0 },
      { month: "Feb", revenue: 0, costs: 0 },
    ]);
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get retention data (placeholder)
router.get('/retention', async (req, res) => {
  try {
    // Return placeholder retention data since no proper tracking yet
    res.json([
      { day: "Day 1", rate: 100 },
      { day: "Day 3", rate: 0 },
      { day: "Day 7", rate: 0 },
      { day: "Day 14", rate: 0 },
      { day: "Day 30", rate: 0 },
      { day: "Day 60", rate: 0 },
      { day: "Day 90", rate: 0 },
    ]);
  } catch (error) {
    console.error('Get retention error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get plan distribution (placeholder)
router.get('/plan-distribution', async (req, res) => {
  try {
    // Get total users for free plan count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Return distribution with all users on free plan since no subscription system yet
    res.json([
      { name: "Free", value: totalUsers || 0, color: "hsl(var(--muted-foreground))" },
      { name: "Starter", value: 0, color: "hsl(210, 80%, 55%)" },
      { name: "Pro", value: 0, color: "hsl(var(--primary))" },
      { name: "Enterprise", value: 0, color: "hsl(150, 60%, 45%)" },
    ]);
  } catch (error) {
    console.error('Get plan distribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feature usage (placeholder)
router.get('/feature-usage', async (req, res) => {
  try {
    // Return placeholder feature usage since no usage tracking yet
    res.json([
      { feature: "Panic Button", usage: 0 },
      { feature: "Lessons", usage: 0 },
      { feature: "Community", usage: 0 },
      { feature: "Sound Therapy", usage: 0 },
      { feature: "AI Companion", usage: 0 },
      { feature: "Progress", usage: 0 },
    ]);
  } catch (error) {
    console.error('Get feature usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
