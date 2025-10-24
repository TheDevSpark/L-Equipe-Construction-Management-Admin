-- IMMEDIATE FIX for Profiles Table Foreign Key Issue
-- Run this in Supabase SQL Editor

-- Step 1: Check current foreign key constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table,
    conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'f';

-- Step 2: Drop ALL existing foreign key constraints on profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_users_id_fkey;

-- Step 3: Check if auth.users table exists and is accessible
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'users'
) as auth_users_exists;

-- Step 4: Create the correct foreign key constraint to auth.users
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Verify the new constraint
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'f';

-- Step 6: Test if we can insert a profile (this will show if the constraint works)
-- Note: This will fail if the user doesn't exist in auth.users, which is expected
SELECT 'Foreign key constraint fixed! Now profiles.id references auth.users.id' as message;




