-- Check project table structure and data
-- Run this in Supabase SQL Editor to verify table structure

-- Check if project table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'project' 
ORDER BY ordinal_position;

-- Check current RLS policies on project table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'project';

-- Check if RLS is enabled on project table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'project';

-- Sample query to test if we can insert (run this after fixing RLS)
-- INSERT INTO project (projectName, budget, projectLocation, projectCollabrate, created_at)
-- VALUES ('Test Project', 100000, 'Test Location', 'Test Collaborator', NOW())
-- RETURNING *;




