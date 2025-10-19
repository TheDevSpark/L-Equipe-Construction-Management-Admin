-- Fix Row Level Security (RLS) for project table
-- Run this in Supabase SQL Editor

-- First, enable RLS on project table (if not already enabled)
ALTER TABLE project ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert projects" ON project;
DROP POLICY IF EXISTS "Allow authenticated users to select projects" ON project;
DROP POLICY IF EXISTS "Allow authenticated users to update projects" ON project;
DROP POLICY IF EXISTS "Allow authenticated users to delete projects" ON project;

-- Create policies for authenticated users
-- Allow authenticated users to insert projects
CREATE POLICY "Allow authenticated users to insert projects" ON project
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to select all projects
CREATE POLICY "Allow authenticated users to select projects" ON project
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users to update projects
CREATE POLICY "Allow authenticated users to update projects" ON project
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete projects
CREATE POLICY "Allow authenticated users to delete projects" ON project
    FOR DELETE TO authenticated
    USING (true);

-- Alternative: If you want to restrict based on user ownership
-- Uncomment these policies instead of the above ones

-- CREATE POLICY "Users can insert their own projects" ON project
--     FOR INSERT TO authenticated
--     WITH CHECK (auth.uid()::text = created_by OR created_by IS NULL);

-- CREATE POLICY "Users can view their own projects" ON project
--     FOR SELECT TO authenticated
--     USING (auth.uid()::text = created_by OR created_by IS NULL);

-- CREATE POLICY "Users can update their own projects" ON project
--     FOR UPDATE TO authenticated
--     USING (auth.uid()::text = created_by OR created_by IS NULL)
--     WITH CHECK (auth.uid()::text = created_by OR created_by IS NULL);

-- CREATE POLICY "Users can delete their own projects" ON project
--     FOR DELETE TO authenticated
--     USING (auth.uid()::text = created_by OR created_by IS NULL);

-- Check if project table structure is correct
-- If you need to add created_by column, uncomment this:
-- ALTER TABLE project ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES auth.users(id);




