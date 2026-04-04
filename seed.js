const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    const sql = fs.readFileSync('test-user.sql', 'utf8');
    await client.query(sql);
    console.log('Test user created successfully!');
  } catch (err) {
    console.error('Error seeding user:', err);
  } finally {
    await client.end();
  }
}

seed();
