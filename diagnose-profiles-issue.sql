-- DIAGNOSTIC QUERIES for Profiles Table Issue
-- Run this in Supabase SQL Editor to understand the current state

-- 1. Check if profiles table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check all foreign key constraints on profiles table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'f';

-- 3. Check if auth.users table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'users'
) as auth_users_exists;

-- 4. Check if there's a public users table
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
) as public_users_exists;

-- 5. Check current profiles data (if any)
SELECT COUNT(*) as profile_count FROM profiles;

-- 6. Check if there are any auth users
SELECT COUNT(*) as auth_user_count FROM auth.users;

-- 7. Show sample auth user IDs (if any exist)
SELECT id, email, created_at 
FROM auth.users 
LIMIT 5;




