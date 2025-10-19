-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist to allow clean re-creation
DROP TABLE IF EXISTS daily_report_attachments CASCADE;
DROP TABLE IF EXISTS daily_report_messages CASCADE;
DROP TABLE IF EXISTS daily_report_categories CASCADE;
DROP TABLE IF EXISTS daily_reports CASCADE;

-- Table for Daily Reports
CREATE TABLE daily_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES project(id) ON DELETE CASCADE NOT NULL,
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

-- Table for Daily Report Categories
CREATE TABLE daily_report_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Daily Report Messages
CREATE TABLE daily_report_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Daily Report Attachments
CREATE TABLE daily_report_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_reports
CREATE POLICY "Allow authenticated users to manage daily reports" ON daily_reports
    FOR ALL TO authenticated
    USING (auth.uid() = (SELECT created_by FROM project WHERE id = project_id))
    WITH CHECK (auth.uid() = (SELECT created_by FROM project WHERE id = project_id));

-- RLS Policies for daily_report_categories
CREATE POLICY "Allow authenticated users to view daily report categories" ON daily_report_categories
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow project managers and admins to manage daily report categories" ON daily_report_categories
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'project_manager')))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'project_manager')));

-- RLS Policies for daily_report_messages
CREATE POLICY "Allow authenticated users to manage daily report messages" ON daily_report_messages
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM daily_reports dr JOIN project p ON dr.project_id = p.id WHERE dr.id = report_id AND p.created_by = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM daily_reports dr JOIN project p ON dr.project_id = p.id WHERE dr.id = report_id AND p.created_by = auth.uid()));

-- RLS Policies for daily_report_attachments
CREATE POLICY "Allow authenticated users to manage daily report attachments" ON daily_report_attachments
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM daily_reports dr JOIN project p ON dr.project_id = p.id WHERE dr.id = report_id AND p.created_by = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM daily_reports dr JOIN project p ON dr.project_id = p.id WHERE dr.id = report_id AND p.created_by = auth.uid()));

-- Insert default categories
INSERT INTO daily_report_categories (name, description, color) VALUES
('Work Progress', 'Daily work progress updates', '#10B981'),
('Safety Issues', 'Safety incidents and concerns', '#EF4444'),
('Equipment', 'Equipment usage and maintenance', '#F59E0B'),
('Materials', 'Material deliveries and usage', '#8B5CF6'),
('Weather', 'Weather conditions and impact', '#06B6D4'),
('Issues', 'General issues and problems', '#F97316');

-- Create storage bucket for daily report files
INSERT INTO storage.buckets (id, name, public)
VALUES ('daily-report-files', 'daily-report-files', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policy for storage bucket
CREATE POLICY "Allow authenticated read access to daily report files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'daily-report-files');

CREATE POLICY "Allow authenticated insert access to daily report files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'daily-report-files');

CREATE POLICY "Allow authenticated update access to daily report files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'daily-report-files')
  WITH CHECK (bucket_id = 'daily-report-files');

CREATE POLICY "Allow authenticated delete access to daily report files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'daily-report-files');



