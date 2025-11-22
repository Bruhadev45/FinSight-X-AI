require('dotenv').config();
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  try {
    console.log('\n🔍 Testing Neon Database Connection...\n');
    
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    const result = await sql`SELECT version()`;
    
    console.log('✅ Database connection successful!');
    console.log('📊 PostgreSQL version:', result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1]);
    console.log('🌐 Host:', process.env.DATABASE_URL.match(/@([^\/]+)/)[1]);
    console.log('\n✅ Ready for deployment!\n');
  } catch (error) {
    console.log('❌ Database connection failed!');
    console.log('Error:', error.message);
    process.exit(1);
  }
}

testConnection();
