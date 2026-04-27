const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get landing page sections
router.get('/sections', async (req, res) => {
  try {
    // Return default landing page sections
    const sections = [
      { id: "hero", name: "Hero Section", enabled: true },
      { id: "logos", name: "Logo Bar", enabled: true },
      { id: "stats", name: "Stats", enabled: true },
      { id: "how-it-works", name: "How It Works", enabled: true },
      { id: "creators", name: "Creators", enabled: true },
      { id: "testimonials", name: "Testimonials", enabled: true },
      { id: "features", name: "Features Grid", enabled: true },
      { id: "pricing", name: "Pricing", enabled: true },
      { id: "faq", name: "FAQ", enabled: true },
      { id: "cta", name: "Final CTA", enabled: true },
    ];
    res.json(sections);
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blog posts
router.get('/blog', async (req, res) => {
  try {
    // Return empty array since no blog posts exist in database yet
    // When blog system is implemented, this will query a blog_posts table
    res.json([]);
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get FAQs
router.get('/faqs', async (req, res) => {
  try {
    // Return empty array since no FAQs exist in database yet
    // When FAQ system is implemented, this will query a faqs table
    res.json([]);
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get testimonials
router.get('/testimonials', async (req, res) => {
  try {
    // Return empty array since no testimonials exist in database yet
    // When testimonial system is implemented, this will query a testimonials table
    res.json([]);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get SEO pages
router.get('/seo', async (req, res) => {
  try {
    // Return default SEO pages
    const seoPages = [
      { path: "/", title: "The Momin Core - Faith & Productivity Platform", description: "Halal-first productivity platform for global Muslim ummah", indexed: true },
      { path: "/login", title: "Log In - The Momin Core", description: "Access your faith and productivity dashboard", indexed: true },
      { path: "/register", title: "Start Free - The Momin Core", description: "Create your account and begin your journey", indexed: true },
      { path: "/blog", title: "Blog - The Momin Core", description: "Islamic productivity tips and guidance", indexed: true },
      { path: "/privacy", title: "Privacy Policy - The Momin Core", description: "How we protect your data and privacy", indexed: false },
    ];
    res.json(seoPages);
  } catch (error) {
    console.error('Get SEO pages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
