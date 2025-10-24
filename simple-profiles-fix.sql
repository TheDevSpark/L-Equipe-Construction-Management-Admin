-- SIMPLE FIX - Just Fix the Foreign Key Constraint
-- Run this in Supabase SQL Editor

-- Drop the existing foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Verify it worked
SELECT 'Foreign key constraint fixed! You can now insert profiles manually.' as message;




