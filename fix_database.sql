-- Add phone verification columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Set existing users to verified=true for backward compatibility
UPDATE users SET phone_verified = true WHERE phone_verified IS NULL;
