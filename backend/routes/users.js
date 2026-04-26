const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get all users (admin endpoint)
router.get('/admin/all', async (req, res) => {
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, verified, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Profiles error:', profilesError);
      return res.status(400).json({ error: profilesError.message });
    }

    // Try to get auth users emails, but handle admin API errors gracefully
    let authUsers = { users: [] };
    try {
      authUsers = await supabase.auth.admin.listUsers();
    } catch (authError) {
      console.warn('Admin API not available, using profiles only:', authError.message);
      // Continue without auth users
    }

    // Combine data
    const users = profiles.map(profile => {
      const authUser = authUsers.users?.find(u => u.id === profile.id);
      return {
        id: profile.id,
        name: profile.full_name || 'Unknown',
        email: authUser?.email || 'No email',
        role: profile.verified ? 'admin' : 'user',
        status: authUser?.email_confirmed_at ? 'active' : 'inactive',
        plan: 'Starter', // Placeholder - would need subscription table
        joined: profile.created_at ? profile.created_at.split('T')[0] : 'N/A',
      };
    });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (admin endpoint)
router.put('/admin/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ verified: role === 'admin' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin endpoint)
router.delete('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Profile will be deleted automatically due to CASCADE

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, city, madhab, goals } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        full_name, 
        city, 
        madhab, 
        goals,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
