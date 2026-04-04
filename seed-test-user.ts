import bcrypt from 'bcryptjs';

// Hash the password "test123"
const password = 'test123';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Hashed password:', hashedPassword);
console.log('\n-- SQL to create test user --');
console.log(`
INSERT INTO users (shop_name, owner_name, email, password_hash) 
VALUES (
  'ร้านก๋วยเตี๋ยวทดสอบ',
  'ทดสอบ',
  'test@example.com',
  '${hashedPassword}'
)
ON CONFLICT (email) DO NOTHING;
`);
