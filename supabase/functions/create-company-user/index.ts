// deno-lint-ignore-file
// @deno-types="https://deno.land/x/types/index.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get service role client (has admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Verify the requesting user is a super admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Check if user is super admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_super_admin) {
      return new Response(
        JSON.stringify({ error: 'Only super admins can create users' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      throw new Error('Invalid JSON in request body');
    }

    const { companyId, userData } = body;

    if (!companyId || !userData?.email || !userData?.password || !userData?.fullName) {
      throw new Error('Missing required fields: companyId, userData.email, userData.password, userData.fullName');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength (minimum 8 characters)
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if user with this email already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(u => u.email === userData.email);
    
    if (emailExists) {
      throw new Error('User with this email already exists');
    }

    // Create user in Supabase Auth
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.fullName,
      },
    });

    if (createError) {
      // Handle specific Supabase auth errors
      if (createError.message?.includes('already registered') || createError.message?.includes('already exists')) {
        throw new Error('User with this email already exists');
      }
      throw new Error(`Failed to create user: ${createError.message}`);
    }
    
    if (!authData.user) {
      throw new Error('Failed to create user: No user data returned');
    }

    // Verify company exists
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      // Clean up: delete the auth user if company doesn't exist
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error('Company not found');
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.fullName,
        is_super_admin: false,
      });

    if (profileError) {
      // Clean up: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // Add user to company
    const { error: companyUserError } = await supabaseAdmin
      .from('company_users')
      .insert({
        company_id: companyId,
        user_id: authData.user.id,
        role: userData.role || 'user',
        is_active: true,
      });

    if (companyUserError) {
      // Clean up: delete profile and auth user if company_users insert fails
      await supabaseAdmin.from('profiles').delete().eq('id', authData.user.id);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to add user to company: ${companyUserError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error creating company user:', error);
    
    // Determine appropriate status code
    let status = 400;
    if (error.message?.includes('authorization') || error.message?.includes('token')) {
      status = 401;
    } else if (error.message?.includes('super admin') || error.message?.includes('permission')) {
      status = 403;
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status,
      }
    );
  }
});

