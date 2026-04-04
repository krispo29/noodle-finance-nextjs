-- Test user for development
-- Password: test123 (hashed with bcrypt)
INSERT INTO users (shop_name, owner_name, email, password_hash) 
VALUES (
  'ร้านก๋วยเตี๋ยวทดสอบ',
  'ทดสอบ',
  'test@example.com',
  '$2a$10$5DJRe9acUw9uBCoXLMfeieYBy/et9YiERjTVfKObsOd3W5D4B4RU6'
)
ON CONFLICT (email) DO NOTHING;
