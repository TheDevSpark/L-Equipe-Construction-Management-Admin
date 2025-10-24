-- Update Project Table to Use Integer ID
-- Run this in Supabase SQL Editor

-- Step 1: Create a new project table with integer ID
CREATE TABLE IF NOT EXISTS project_new (
    id SERIAL PRIMARY KEY,
    projectName TEXT NOT NULL,
    budget DECIMAL(15,2),
    projectLocation TEXT,
    projectCollabrate TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT REFERENCES auth.users(id)
);

-- Step 2: Copy existing data (if any) from old table to new table
-- This will preserve existing projects and assign new integer IDs
INSERT INTO project_new (projectName, budget, projectLocation, projectCollabrate, created_at, updated_at, created_by)
SELECT projectName, budget, projectLocation, projectCollabrate, created_at, updated_at, created_by
FROM project;

-- Step 3: Drop the old project table
DROP TABLE IF EXISTS project CASCADE;

-- Step 4: Rename the new table to project
ALTER TABLE project_new RENAME TO project;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_created_at ON project(created_at);
CREATE INDEX IF NOT EXISTS idx_project_created_by ON project(created_by);

-- Step 6: Create updated_at trigger
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

-- Step 7: Enable RLS
ALTER TABLE project ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
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

-- Step 9: Update project_schedules table to use integer project_id
-- First, let's check if project_schedules table exists and update it
DO $$
BEGIN
    -- Check if project_schedules table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_schedules') THEN
        -- Drop and recreate with integer project_id
        DROP TABLE IF EXISTS project_schedules CASCADE;
        
        CREATE TABLE project_schedules (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
            data JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_project_schedules_project_id ON project_schedules(project_id);
        
        -- Enable RLS
        ALTER TABLE project_schedules ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies for project_schedules
        CREATE POLICY "Allow authenticated users to insert project schedules" ON project_schedules
            FOR INSERT TO authenticated
            WITH CHECK (true);
            
        CREATE POLICY "Allow authenticated users to select project schedules" ON project_schedules
            FOR SELECT TO authenticated
            USING (true);
            
        CREATE POLICY "Allow authenticated users to update project schedules" ON project_schedules
            FOR UPDATE TO authenticated
            USING (true)
            WITH CHECK (true);
            
        CREATE POLICY "Allow authenticated users to delete project schedules" ON project_schedules
            FOR DELETE TO authenticated
            USING (true);
    END IF;
END $$;

-- Step 10: Update other tables that reference project_id
-- Update daily_reports table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_reports') THEN
        -- Drop and recreate with integer project_id
        DROP TABLE IF EXISTS daily_reports CASCADE;
        
        CREATE TABLE daily_reports (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
            report_date DATE NOT NULL,
            weather_conditions TEXT,
            temperature_min INTEGER,
            temperature_max INTEGER,
            work_completed TEXT,
            work_in_progress TEXT,
            issues_encountered TEXT,
            safety_incidents TEXT,
            equipment_used TEXT,
            materials_delivered TEXT,
            next_day_plan TEXT,
            progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
            status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
            submitted_by TEXT,
            submitted_at TIMESTAMP WITH TIME ZONE,
            approved_by TEXT,
            approved_at TIMESTAMP WITH TIME ZONE,
            rejection_reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_daily_reports_project_id ON daily_reports(project_id);
        CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON daily_reports(report_date);
        
        -- Enable RLS
        ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Allow authenticated users to insert daily reports" ON daily_reports
            FOR INSERT TO authenticated
            WITH CHECK (true);
            
        CREATE POLICY "Allow authenticated users to select daily reports" ON daily_reports
            FOR SELECT TO authenticated
            USING (true);
            
        CREATE POLICY "Allow authenticated users to update daily reports" ON daily_reports
            FOR UPDATE TO authenticated
            USING (true)
            WITH CHECK (true);
            
        CREATE POLICY "Allow authenticated users to delete daily reports" ON daily_reports
            FOR DELETE TO authenticated
            USING (true);
    END IF;
END $$;

-- Update budget_categories table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'budget_categories') THEN
        DROP TABLE IF EXISTS budget_categories CASCADE;
        
        CREATE TABLE budget_categories (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
            category_name TEXT NOT NULL,
            allocated_amount DECIMAL(15,2) NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by TEXT REFERENCES auth.users(id)
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_budget_categories_project_id ON budget_categories(project_id);
        
        -- Enable RLS
        ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Allow authenticated users to insert budget categories" ON budget_categories
            FOR INSERT TO authenticated
            WITH CHECK (true);
            
        CREATE POLICY "Allow authenticated users to select budget categories" ON budget_categories
            FOR SELECT TO authenticated
            USING (true);
            
        CREATE POLICY "Allow authenticated users to update budget categories" ON budget_categories
            FOR UPDATE TO authenticated
            USING (true)
            WITH CHECK (true);
            
        CREATE POLICY "Allow authenticated users to delete budget categories" ON budget_categories
            FOR DELETE TO authenticated
            USING (true);
    END IF;
END $$;

-- Update expenses table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses') THEN
        DROP TABLE IF EXISTS expenses CASCADE;
        
        CREATE TABLE expenses (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
            category_id INTEGER REFERENCES budget_categories(id) ON DELETE SET NULL,
            expense_name TEXT NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            expense_date DATE NOT NULL,
            vendor TEXT,
            payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
            receipt_url TEXT,
            receipt_file_name TEXT,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by TEXT REFERENCES auth.users(id)
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
        CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
        
        -- Enable RLS
        ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Allow authenticated users to insert expenses" ON expenses
            FOR INSERT TO authenticated
            WITH CHECK (true);
            
        CREATE POLICY "Allow authenticated users to select expenses" ON expenses
            FOR SELECT TO authenticated
            USING (true);
            
        CREATE POLICY "Allow authenticated users to update expenses" ON expenses
            FOR UPDATE TO authenticated
            USING (true)
            WITH CHECK (true);
            
        CREATE POLICY "Allow authenticated users to delete expenses" ON expenses
            FOR DELETE TO authenticated
            USING (true);
    END IF;
END $$;

-- Success message
SELECT 'Project table and related tables updated to use integer IDs successfully!' as message;




