const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get notification statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total notifications sent
    const { count: totalSent } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    // Get read notifications
    const { count: readCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', true);

    // Get unread notifications
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    const sent = totalSent || 0;
    const opened = readCount || 0;
    const delivered = totalSent || 0; // All notifications are considered delivered for now

    res.json({
      sent: 0, // No admin campaigns sent yet
      totalDelivered: delivered,
      totalOpened: opened,
      avgOpenRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notifications (admin campaigns)
router.get('/campaigns', async (req, res) => {
  try {
    // Return empty array since no admin notification campaigns exist in database yet
    // When admin notification system is implemented, this will query a campaigns table
    // For now, we'll show user notifications as a reference
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, message, type, read, created_at')
      .limit(10)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Campaigns query error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Transform user notifications to look like admin campaigns for demo purposes
    const campaigns = data?.map(notif => ({
      id: notif.id,
      title: notif.title,
      body: notif.message || 'No message content',
      audience: 'All Users', // Default audience
      channel: 'Push', // Default channel
      sent: notif.created_at.split('T')[0],
      delivered: 1, // Each notification is delivered to one user
      opened: notif.read ? 1 : 0,
      status: 'sent', // All are sent
    })) || [];

    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
