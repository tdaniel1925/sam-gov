// =============================================================================
// INSERT DEMO USER RECORD
// Ensures demo user exists in users table with correct tier
// =============================================================================

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

async function insertDemoUserRecord() {
  console.log('🔧 Setting up demo user record in users table...\n');

  const sql = postgres(databaseUrl);

  try {
    const demoUserId = '27ab990a-9658-4fde-a789-c2924aac4210';
    const demoEmail = 'demo@demo.com';
    const demoName = 'Demo User';

    // Check if user record exists
    const existingUser = await sql`
      SELECT * FROM users WHERE id = ${demoUserId}
    `;

    if (existingUser.length > 0) {
      console.log('✅ Demo user record already exists in users table');
      console.log('📧 Email:', existingUser[0].email);
      console.log('👤 Name:', existingUser[0].full_name);
      console.log('🎫 Tier:', existingUser[0].tier);
      console.log('🔢 User ID:', existingUser[0].id);
    } else {
      // Insert user record
      const result = await sql`
        INSERT INTO users (id, email, full_name, tier, daily_searches_used, setup_fee_paid)
        VALUES (${demoUserId}, ${demoEmail}, ${demoName}, 'free', 0, false)
        RETURNING *
      `;

      console.log('✅ Demo user record created in users table!');
      console.log('📧 Email:', result[0].email);
      console.log('👤 Name:', result[0].full_name);
      console.log('🎫 Tier:', result[0].tier);
      console.log('🔢 User ID:', result[0].id);
    }

    await sql.end();

    console.log('\n✅ Demo user is ready to use!');
    console.log('\n🔐 Login credentials:');
    console.log('   Email: demo@demo.com');
    console.log('   Password: demo123');
    console.log('\n📝 Note: Free tier = 1 search/day with platform API keys');
    console.log('   To unlock unlimited searches, add your own API keys in Profile!');

  } catch (error) {
    console.error('❌ Failed to set up demo user:', error.message);
    await sql.end();
    process.exit(1);
  }
}

insertDemoUserRecord()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
