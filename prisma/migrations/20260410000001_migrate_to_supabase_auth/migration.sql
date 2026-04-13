-- Remove PasswordResetToken table (handled by Supabase Auth)
DROP TABLE IF EXISTS "PasswordResetToken";

-- Remove passwordHash column from User (handled by Supabase Auth)
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";
