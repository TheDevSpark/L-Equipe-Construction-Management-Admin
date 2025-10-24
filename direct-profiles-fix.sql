-- DIRECT FIX FOR PROFILES TABLE DATA INSERTION
-- Run this in Supabase SQL Editor

-- Step 1: First, let's see what's in the profiles table
SELECT 'Current profiles data:' as info;
SELECT * FROM profiles;

-- Step 2: Check if there are any auth users
SELECT 'Auth users:' as info;
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- Step 3: Drop any existing foreign key constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 4: Make sure the profiles table has the right structure
-- Add missing columns if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 5: Add the correct foreign key constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 6: Create a simple function to insert profile
CREATE OR REPLACE FUNCTION insert_user_profile(
    user_id UUID,
    user_email TEXT,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    phone_number TEXT DEFAULT '',
    user_role TEXT DEFAULT 'admin'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO profiles (id, email, first_name, last_name, phone_number, role, created_at, updated_at)
    VALUES (user_id, user_email, first_name, last_name, phone_number, user_role, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone_number = EXCLUDED.phone_number,
        role = EXCLUDED.role,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Test the function with existing auth users
-- This will create profiles for any existing auth users
DO $$
DECLARE
    auth_user RECORD;
BEGIN
    FOR auth_user IN SELECT id, email FROM auth.users LOOP
        PERFORM insert_user_profile(
            auth_user.id,
            auth_user.email,
            '',
            '',
            '',
            'admin'
        );
    END LOOP;
END $$;

-- Step 8: Check the results
SELECT 'After fix - profiles data:' as info;
SELECT * FROM profiles;

-- Step 9: Create trigger for future users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM insert_user_profile(
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
        'admin'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
SELECT 'SUCCESS: Profiles table fixed! All existing users now have profiles, and new users will get profiles automatically.' as result;




