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

// Admin Add User
router.post('/admin/add-user', async (req, res) => {
  try {
    const { name, email, role, plan } = req.body;

    // Validation
    if (!name || !email || !role || !plan) {
      return res.status(400).json({ error: 'Name, email, role, and plan are required' });
    }

    // Generate a random password for the new user
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    
    // Register user with Supabase
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: role,
        plan: plan,
        created_by_admin: true,
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create user profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: name,
        email: email,
        role: role,
        plan: plan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail the request if profile creation fails, just log it
    }

    res.status(201).json({ 
      message: 'User created successfully',
      user: data.user,
      tempPassword: password, // Return temp password for admin to give to user
    });
  } catch (error) {
    console.error('Admin add user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Update User Role
router.put('/admin/update-role', async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    if (!userId || !newRole) {
      return res.status(400).json({ error: 'User ID and new role are required' });
    }

    // Get current role for history
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update role in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Record role change in history
    await supabase
      .from('user_role_history')
      .insert({
        user_id: userId,
        old_role: currentProfile.role,
        new_role: newRole,
        changed_by: 'admin', // This would come from authenticated admin
        changed_at: new Date().toISOString()
      });

    res.json({ 
      message: 'User role updated successfully',
      user: data
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Ban/Unban User
router.put('/admin/toggle-ban', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get current status
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', userId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Toggle status
    const newStatus = currentProfile.status === 'banned' ? 'active' : 'banned';

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      message: `User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully`,
      user: data
    });
  } catch (error) {
    console.error('Toggle ban error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Delete User
router.delete('/admin/delete-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // First, delete from profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // Delete from auth.users (this will cascade delete related data)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Auth user deletion error:', authError);
      // Don't fail the request if auth deletion fails, profile is already deleted
    }

    res.json({ 
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Send Email
router.post('/admin/send-email', async (req, res) => {
  try {
    const { userId, subject, message } = req.body;

    if (!userId || !subject || !message) {
      return res.status(400).json({ error: 'User ID, subject, and message are required' });
    }

    // Get user email
    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Here you would integrate with your email service (SendGrid, etc.)
    // For now, we'll just log it and return success
    console.log('Email would be sent to:', user.email);
    console.log('Subject:', subject);
    console.log('Message:', message);

    // TODO: Implement actual email sending logic
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // const msg = {
    //   to: user.email,
    //   from: 'noreply@momincore.com',
    //   subject: subject,
    //   text: message,
    // };
    // await sgMail.send(msg);

    res.json({ 
      message: 'Email sent successfully',
      email: user.email
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Get User Details
router.get('/admin/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data: user, error } = await supabase
      .from('profiles')
      .select(`
        *,
        daily_goals(count),
        streaks(count),
        user_library_progress(count)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
