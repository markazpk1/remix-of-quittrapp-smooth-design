const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, city, madhab, age_confirmed, shariah_rules_agreed } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    if (!age_confirmed || !shariah_rules_agreed) {
      return res.status(400).json({ error: 'Age confirmation and Shariah rules agreement are required' });
    }

    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          city: city || null,
          madhab: madhab || null,
          age_confirmed,
          shariah_rules_agreed,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ 
      message: 'User registered successfully',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ 
      message: 'Login successful',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { token } = req.body;

    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ user: data.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Admin login attempt:', { email, password: '***' });

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For development: allow specific admin credentials
    if (email === 'admin@momincore.com' && password === 'admin123456') {
      console.log('Using development admin credentials');
      
      // Try to get the user from Supabase
      const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase auth result:', { error: userError?.message });

      if (userError && !userError.message.includes('Email not confirmed')) {
        console.log('Auth error (not email confirmation):', userError.message);
        return res.status(401).json({ error: userError.message });
      }

      // If email not confirmed, create a mock session for development
      if (userError && userError.message.includes('Email not confirmed')) {
        console.log('Email not confirmed, creating mock session');
        const mockSession = {
          access_token: 'dev-admin-token-' + Date.now(),
          user: {
            id: 'dev-admin-id',
            email: 'admin@momincore.com',
            user_metadata: { full_name: 'Test Admin' }
          }
        };
        
        return res.json({ 
          message: 'Admin login successful (development mode)',
          user: mockSession.user,
          session: mockSession,
          isAdmin: true
        });
      }

      // Normal login flow
      console.log('Normal login flow successful');
      return res.json({ 
        message: 'Admin login successful',
        user: userData.user,
        session: userData.session,
        isAdmin: true
      });
    }

    console.log('Not development admin, checking production flow');
    
    // For production: check if user is admin by profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('verified')
      .eq('email', email)
      .single();

    console.log('Profile check result:', { error: profileError?.message, profile });

    if (profileError || !profile || !profile.verified) {
      console.log('Access denied - not verified admin');
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Then sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Production login error:', error.message);
      return res.status(401).json({ error: error.message });
    }

    console.log('Production login successful');
    res.json({ 
      message: 'Admin login successful',
      user: data.user,
      session: data.session,
      isAdmin: true
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm email for admin users (development only)
router.post('/admin/confirm-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      return res.status(500).json({ error: 'Failed to list users' });
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user email confirmation
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({ message: 'Email confirmed successfully', user: updatedUser });
  } catch (error) {
    console.error('Confirm email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
