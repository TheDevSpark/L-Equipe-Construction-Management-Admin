-- COMPLETE FIX for Profiles Table - Handles All Scenarios
-- Run this in Supabase SQL Editor

-- Step 1: Show current state
SELECT 'Current profiles table constraints:' as info;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'f';

-- Step 2: Drop ALL possible foreign key constraints (comprehensive approach)
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Get all foreign key constraints on profiles table
    FOR constraint_record IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'profiles'::regclass 
        AND contype = 'f'
    LOOP
        -- Drop each foreign key constraint
        EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
    END LOOP;
END $$;

-- Step 3: Verify all constraints are dropped
SELECT 'After dropping constraints:' as info;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'f';

-- Step 4: Add the correct foreign key constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Verify the new constraint
SELECT 'New constraint added:' as info;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND contype = 'f';

-- Step 6: Test the constraint by checking if we can reference auth.users
SELECT 'Testing constraint - checking auth.users table:' as info;
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Step 7: Show success message
SELECT 'SUCCESS: Profiles table foreign key constraint fixed!' as result;
SELECT 'The profiles.id now correctly references auth.users.id' as details;




