// Admin API functions that would typically be server-side
// For now, these are client-side implementations that simulate admin operations

import { supabase } from './supabase';

// This function should be moved to a server-side API endpoint
// that uses the service role key for proper admin operations
export const createAdminUser = async (userData: {
  name: string;
  email: string;
  role: string;
  plan: string;
}) => {
  try {
    // Generate a temporary password
    const tempPassword = generateTempPassword();
    
    // For demo purposes, we'll create a user profile in the database
    // In production, this should call a server-side API endpoint with service role key
    
    const mockUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create user in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: mockUserId,
        full_name: userData.name,
        email: userData.email,
        role: userData.role,
        plan: userData.plan,
        created_at: new Date().toISOString(),
        temp_password: tempPassword,
        created_by_admin: true,
        auth_method: 'admin_created'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('A user with this email already exists');
      }
      throw error;
    }

    return {
      success: true,
      data: {
        ...data,
        tempPassword,
        note: 'User created in database. For full auth integration, set up service role API endpoint.'
      }
    };
  } catch (error) {
    console.error('Admin user creation error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create user'
    };
  }
};

// Helper function to generate temporary password
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Instructions for setting up proper server-side admin API:
/*
To properly implement admin user creation, you need to:

1. Create a server-side API endpoint (e.g., using Supabase Edge Functions, Next.js API routes, or Express.js)

2. Example Edge Function (supabase/functions/create-user/index.ts):

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  try {
    const { name, email, role, plan } = await req.json()
    
    const tempPassword = generateTempPassword()
    
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role,
        plan,
        created_by_admin: true
      }
    })
    
    if (error) throw error
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          id: user.id, 
          email, 
          name, 
          role, 
          plan, 
          tempPassword 
        } 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

3. Add the service role key to your environment variables:
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

4. Update the client-side code to call this endpoint instead
*/
