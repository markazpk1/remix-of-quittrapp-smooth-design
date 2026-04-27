const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get general settings
router.get('/general', async (req, res) => {
  try {
    // Return default general settings
    // When settings system is implemented, this will query a settings table
    res.json({
      siteName: "QuittrApp",
      supportEmail: "support@quittrapp.com",
      siteUrl: "https://quittrapp.com",
      defaultTimezone: "utc",
      features: [
        { label: "Maintenance Mode", desc: "Show maintenance page", value: false },
        { label: "User Registration", desc: "Allow new signups", value: true },
        { label: "Email Notifications", desc: "Send email alerts", value: true },
        { label: "Analytics Tracking", desc: "Collect usage data", value: true },
        { label: "Community Posts", desc: "Allow community posting", value: true },
        { label: "AI Companion", desc: "Enable AI chat support", value: true },
      ]
    });
  } catch (error) {
    console.error('Get general settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get branding settings
router.get('/branding', async (req, res) => {
  try {
    // Return default branding settings
    // When branding system is implemented, this will query a branding table
    res.json({
      logo: "Q", // Default logo text
      brandColor: "#7C3AED",
      appDescription: "Break free from addiction with science-backed tools."
    });
  } catch (error) {
    console.error('Get branding settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get email templates
router.get('/emails', async (req, res) => {
  try {
    // Return default email templates
    // When email system is implemented, this will query an email_templates table
    res.json([
      { name: "Welcome Email", subject: "Welcome to QuittrApp! 🎉", lastEdited: "2026-02-20", status: "active" },
      { name: "Password Reset", subject: "Reset your password", lastEdited: "2026-02-15", status: "active" },
      { name: "Streak Milestone", subject: "🔥 You hit {{days}} days!", lastEdited: "2026-02-10", status: "active" },
      { name: "Subscription Confirmation", subject: "Your Pro plan is active", lastEdited: "2026-01-28", status: "active" },
      { name: "Relapse Support", subject: "We're here for you", lastEdited: "2026-01-20", status: "draft" },
      { name: "Weekly Digest", subject: "Your weekly progress report", lastEdited: "2026-01-15", status: "active" },
    ]);
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get integrations
router.get('/integrations', async (req, res) => {
  try {
    // Return default integrations
    // When integrations system is implemented, this will query an integrations table
    res.json([
      { name: "Stripe", description: "Payment processing", connected: true, icon: "💳" },
      { name: "SendGrid", description: "Email delivery", connected: true, icon: "📧" },
      { name: "Firebase", description: "Push notifications", connected: true, icon: "🔔" },
      { name: "Google Analytics", description: "Website analytics", connected: false, icon: "📊" },
      { name: "Slack", description: "Team alerts", connected: false, icon: "💬" },
      { name: "Intercom", description: "Live chat", connected: false, icon: "🎧" },
    ]);
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get API keys
router.get('/api-keys', async (req, res) => {
  try {
    // Return default API keys (masked for security)
    // When API key system is implemented, this will query an api_keys table
    res.json([
      { name: "Production API Key", key: "pk_live_****************************3x9f", created: "2026-01-15", lastUsed: "2 min ago", status: "active" },
      { name: "Stripe Webhook Secret", key: "whsec_****************************h4kl", created: "2026-01-15", lastUsed: "5 min ago", status: "active" },
      { name: "Test API Key", key: "pk_test_****************************m2wq", created: "2026-02-01", lastUsed: "3 days ago", status: "active" },
      { name: "Legacy Key (v1)", key: "sk_old_****************************p8nj", created: "2025-06-10", lastUsed: "Never", status: "revoked" },
    ]);
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get security settings
router.get('/security', async (req, res) => {
  try {
    // Return default security settings
    // When security system is implemented, this will query a security_settings table
    res.json({
      settings: [
        { label: "Two-Factor Authentication", desc: "Require 2FA for admins", value: true },
        { label: "Session Timeout", desc: "Auto-logout after 30 min", value: true },
        { label: "IP Whitelisting", desc: "Restrict admin IPs", value: false },
        { label: "Login Rate Limiting", desc: "Block after 5 failed attempts", value: true },
        { label: "Audit Log Retention", desc: "Keep logs for 90 days", value: true },
        { label: "Data Encryption", desc: "Encrypt sensitive data at rest", value: true },
      ],
      passwordPolicy: {
        minLength: 8
      }
    });
  } catch (error) {
    console.error('Get security settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update general settings (placeholder)
router.put('/general', async (req, res) => {
  try {
    // Placeholder for general settings update functionality
    // When settings system is implemented, this will update settings in database
    res.status(501).json({ error: 'General settings update not implemented yet' });
  } catch (error) {
    console.error('Update general settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update branding settings (placeholder)
router.put('/branding', async (req, res) => {
  try {
    // Placeholder for branding settings update functionality
    // When branding system is implemented, this will update branding in database
    res.status(501).json({ error: 'Branding settings update not implemented yet' });
  } catch (error) {
    console.error('Update branding settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate API key (placeholder)
router.post('/api-keys', async (req, res) => {
  try {
    // Placeholder for API key generation functionality
    // When API key system is implemented, this will generate and store new keys
    res.status(501).json({ error: 'API key generation not implemented yet' });
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rotate API key (placeholder)
router.put('/api-keys/:name/rotate', async (req, res) => {
  try {
    // Placeholder for API key rotation functionality
    // When API key system is implemented, this will rotate existing keys
    res.status(501).json({ error: 'API key rotation not implemented yet' });
  } catch (error) {
    console.error('Rotate API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Revoke API key (placeholder)
router.delete('/api-keys/:name', async (req, res) => {
  try {
    // Placeholder for API key revocation functionality
    // When API key system is implemented, this will revoke existing keys
    res.status(501).json({ error: 'API key revocation not implemented yet' });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle integration (placeholder)
router.put('/integrations/:name/toggle', async (req, res) => {
  try {
    // Placeholder for integration toggle functionality
    // When integrations system is implemented, this will toggle integration status
    res.status(501).json({ error: 'Integration toggle not implemented yet' });
  } catch (error) {
    console.error('Toggle integration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
