-- Create project table if it doesn't exist
-- Run this in Supabase SQL Editor

-- Create project table with proper structure
CREATE TABLE IF NOT EXISTS project (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    projectName TEXT NOT NULL,
    budget DECIMAL(15,2),
    projectLocation TEXT,
    projectCollabrate TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_created_at ON project(created_at);
CREATE INDEX IF NOT EXISTS idx_project_created_by ON project(created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_project_updated_at ON project;
CREATE TRIGGER update_project_updated_at
    BEFORE UPDATE ON project
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE project ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert projects" ON project;
DROP POLICY IF EXISTS "Allow authenticated users to select projects" ON project;
DROP POLICY IF EXISTS "Allow authenticated users to update projects" ON project;
DROP POLICY IF EXISTS "Allow authenticated users to delete projects" ON project;

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

-- Verify table creation
SELECT 'Project table created successfully' as status;




