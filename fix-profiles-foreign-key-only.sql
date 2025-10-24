-- Fix Only the Foreign Key Constraint (Keep Existing Data)
-- Run this in Supabase SQL Editor

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Add the correct foreign key constraint to auth.users
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Verify the constraint was added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'f';

-- Success message
SELECT 'Foreign key constraint fixed! Profiles table now correctly references auth.users' as message;




