// =============================================================================
// CREATE DEMO USER SCRIPT
// Creates demo user in Supabase Auth
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Create Supabase admin client (can bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createDemoUser() {
  console.log('🔧 Creating demo user...\n');

  const demoEmail = 'demo@demo.com';
  const demoPassword = 'demo123';
  const demoName = 'Demo User';

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error checking existing users:', listError);
      throw listError;
    }

    const existingUser = existingUsers.users.find(u => u.email === demoEmail);

    if (existingUser) {
      console.log('✅ Demo user already exists!');
      console.log('📧 Email:', demoEmail);
      console.log('👤 User ID:', existingUser.id);
      console.log('🔑 Password: demo123');
      return existingUser;
    }

    // Create demo user using Supabase Admin API
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: demoName,
        name: demoName,
      },
    });

    if (createError) {
      console.error('❌ Error creating user:', createError);
      throw createError;
    }

    console.log('✅ Demo user created successfully!');
    console.log('📧 Email:', demoEmail);
    console.log('🔑 Password:', demoPassword);
    console.log('👤 Name:', demoName);
    console.log('🆔 User ID:', newUser.user.id);

    // Insert user record into users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: newUser.user.id,
        email: demoEmail,
        full_name: demoName,
        tier: 'free',
        daily_searches_used: 0,
        setup_fee_paid: false,
      });

    if (insertError) {
      console.warn('⚠️  Warning: Could not create user record in users table:', insertError.message);
      console.log('   The user can still log in, but tier features may not work correctly.');
    } else {
      console.log('✅ User record created in users table');
    }

    return newUser.user;

  } catch (error) {
    console.error('❌ Failed to create demo user:', error);
    process.exit(1);
  }
}

// Run the script
createDemoUser()
  .then(() => {
    console.log('\n✅ Demo user setup complete!');
    console.log('\n🔐 Login credentials:');
    console.log('   Email: demo@demo.com');
    console.log('   Password: demo123');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
