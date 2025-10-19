-- Team Management Database Setup
-- Run this in Supabase SQL Editor

-- 1. Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    role TEXT NOT NULL CHECK (role IN ('project_manager', 'engineer', 'architect', 'contractor', 'supervisor', 'worker', 'admin')),
    specialization TEXT,
    hourly_rate DECIMAL(10,2),
    availability_status TEXT CHECK (availability_status IN ('available', 'busy', 'unavailable')) DEFAULT 'available',
    join_date DATE DEFAULT CURRENT_DATE,
    profile_image_url TEXT,
    bio TEXT,
    skills TEXT[], -- Array of skills
    certifications TEXT[], -- Array of certifications
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Project Team Assignments Table
CREATE TABLE IF NOT EXISTS project_team_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES project(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    assigned_role TEXT NOT NULL, -- Role on this specific project
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    hourly_rate DECIMAL(10,2), -- Can override default rate for this project
    allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    status TEXT CHECK (status IN ('active', 'inactive', 'completed', 'terminated')) DEFAULT 'active',
    notes TEXT,
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, team_member_id) -- Prevent duplicate assignments
);

-- 3. Team Member Skills Table (for detailed skill tracking)
CREATE TABLE IF NOT EXISTS team_member_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')) NOT NULL,
    years_experience INTEGER,
    certified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_member_id, skill_name)
);

-- 4. Team Member Availability Table
CREATE TABLE IF NOT EXISTS team_member_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status TEXT CHECK (status IN ('available', 'busy', 'unavailable', 'on_leave')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_member_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_availability ON team_members(availability_status);
CREATE INDEX IF NOT EXISTS idx_project_team_assignments_project_id ON project_team_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_assignments_team_member_id ON project_team_assignments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_project_team_assignments_status ON project_team_assignments(status);
CREATE INDEX IF NOT EXISTS idx_team_member_skills_team_member_id ON team_member_skills(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_availability_team_member_id ON team_member_availability(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_availability_date ON team_member_availability(date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_team_assignments_updated_at
    BEFORE UPDATE ON project_team_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for team_members
DROP POLICY IF EXISTS "Allow authenticated users to manage team members" ON team_members;
CREATE POLICY "Allow authenticated users to manage team members" ON team_members
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for project_team_assignments
DROP POLICY IF EXISTS "Allow authenticated users to manage project team assignments" ON project_team_assignments;
CREATE POLICY "Allow authenticated users to manage project team assignments" ON project_team_assignments
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for team_member_skills
DROP POLICY IF EXISTS "Allow authenticated users to manage team member skills" ON team_member_skills;
CREATE POLICY "Allow authenticated users to manage team member skills" ON team_member_skills
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for team_member_availability
DROP POLICY IF EXISTS "Allow authenticated users to manage team member availability" ON team_member_availability;
CREATE POLICY "Allow authenticated users to manage team member availability" ON team_member_availability
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert sample team members
INSERT INTO team_members (first_name, last_name, email, phone_number, role, specialization, hourly_rate, skills, certifications) VALUES
('John', 'Smith', 'john.smith@company.com', '+1-555-0101', 'project_manager', 'Construction Management', 75.00, ARRAY['Project Planning', 'Team Leadership', 'Budget Management'], ARRAY['PMP Certification', 'Safety Management']),
('Sarah', 'Johnson', 'sarah.johnson@company.com', '+1-555-0102', 'engineer', 'Civil Engineering', 85.00, ARRAY['Structural Design', 'CAD', 'Project Engineering'], ARRAY['PE License', 'AutoCAD Certified']),
('Mike', 'Rodriguez', 'mike.rodriguez@company.com', '+1-555-0103', 'architect', 'Architecture', 90.00, ARRAY['Architectural Design', '3D Modeling', 'Building Codes'], ARRAY['Licensed Architect', 'LEED Certified']),
('Lisa', 'Chen', 'lisa.chen@company.com', '+1-555-0104', 'supervisor', 'Construction Supervision', 65.00, ARRAY['Site Supervision', 'Quality Control', 'Safety Management'], ARRAY['OSHA 30', 'First Aid Certified']),
('David', 'Wilson', 'david.wilson@company.com', '+1-555-0105', 'contractor', 'General Contracting', 70.00, ARRAY['General Construction', 'Subcontractor Management', 'Cost Estimation'], ARRAY['General Contractor License']),
('Emma', 'Brown', 'emma.brown@company.com', '+1-555-0106', 'worker', 'Carpentry', 45.00, ARRAY['Carpentry', 'Framing', 'Finish Work'], ARRAY['Trade Certification']),
('Alex', 'Taylor', 'alex.taylor@company.com', '+1-555-0107', 'worker', 'Electrical', 50.00, ARRAY['Electrical Installation', 'Wiring', 'Electrical Systems'], ARRAY['Electrician License']),
('Maria', 'Garcia', 'maria.garcia@company.com', '+1-555-0108', 'worker', 'Plumbing', 48.00, ARRAY['Plumbing Installation', 'Pipe Fitting', 'Water Systems'], ARRAY['Plumber License'])
ON CONFLICT (email) DO NOTHING;

-- Create views for easier querying
CREATE OR REPLACE VIEW project_team_overview AS
SELECT 
    p.id as project_id,
    p.projectName,
    COUNT(DISTINCT pta.team_member_id) as team_size,
    COUNT(DISTINCT CASE WHEN pta.status = 'active' THEN pta.team_member_id END) as active_members,
    COALESCE(SUM(tm.hourly_rate * pta.allocation_percentage / 100), 0) as estimated_hourly_cost
FROM project p
LEFT JOIN project_team_assignments pta ON p.id = pta.project_id
LEFT JOIN team_members tm ON pta.team_member_id = tm.id
GROUP BY p.id, p.projectName;

-- Create function to get team members by project
CREATE OR REPLACE FUNCTION get_project_team(project_uuid UUID)
RETURNS TABLE (
    team_member_id UUID,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    role TEXT,
    specialization TEXT,
    assigned_role TEXT,
    hourly_rate DECIMAL,
    allocation_percentage INTEGER,
    status TEXT,
    start_date DATE,
    end_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tm.id,
        tm.first_name,
        tm.last_name,
        tm.email,
        tm.role,
        tm.specialization,
        pta.assigned_role,
        COALESCE(pta.hourly_rate, tm.hourly_rate) as hourly_rate,
        pta.allocation_percentage,
        pta.status,
        pta.start_date,
        pta.end_date
    FROM team_members tm
    JOIN project_team_assignments pta ON tm.id = pta.team_member_id
    WHERE pta.project_id = project_uuid
    ORDER BY tm.first_name, tm.last_name;
END;
$$ LANGUAGE plpgsql;

-- Create function to check team member availability
CREATE OR REPLACE FUNCTION check_team_member_availability(member_uuid UUID, check_date DATE)
RETURNS TEXT AS $$
DECLARE
    availability_status TEXT;
BEGIN
    -- Check specific date availability
    SELECT status INTO availability_status
    FROM team_member_availability
    WHERE team_member_id = member_uuid AND date = check_date;
    
    -- If no specific date record, return general availability
    IF availability_status IS NULL THEN
        SELECT availability_status INTO availability_status
        FROM team_members
        WHERE id = member_uuid;
    END IF;
    
    RETURN COALESCE(availability_status, 'unavailable');
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Verify setup
SELECT 'Team management database setup completed successfully!' as status;



