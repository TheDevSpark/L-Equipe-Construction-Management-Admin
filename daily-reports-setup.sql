-- Daily Reports Database Setup
-- Run this in Supabase SQL Editor

-- 1. Daily Reports Table
CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES project(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES auth.users(id),
    report_date DATE NOT NULL,
    weather_condition TEXT,
    temperature DECIMAL(5,2),
    work_summary TEXT NOT NULL,
    work_completed TEXT NOT NULL,
    work_in_progress TEXT,
    work_scheduled TEXT,
    materials_used TEXT,
    equipment_used TEXT,
    safety_incidents TEXT,
    quality_issues TEXT,
    delays_reasons TEXT,
    photos_urls TEXT[], -- Array of photo URLs
    total_workers INTEGER DEFAULT 0,
    total_work_hours DECIMAL(5,2) DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'needs_revision')) DEFAULT 'draft',
    admin_notes TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Daily Report Messages Table (for communication)
CREATE TABLE IF NOT EXISTS daily_report_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('comment', 'question', 'clarification', 'approval', 'rejection')) DEFAULT 'comment',
    is_admin_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Daily Report Attachments Table
CREATE TABLE IF NOT EXISTS daily_report_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Daily Report Categories Table (for better organization)
CREATE TABLE IF NOT EXISTS daily_report_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Daily Report Template Table (for standardized reporting)
CREATE TABLE IF NOT EXISTS daily_report_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES project(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_content JSONB NOT NULL, -- Structured template content
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_reports_project_id ON daily_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_reporter_id ON daily_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_status ON daily_reports(status);
CREATE INDEX IF NOT EXISTS idx_daily_reports_approved_by ON daily_reports(approved_by);
CREATE INDEX IF NOT EXISTS idx_daily_report_messages_report_id ON daily_report_messages(report_id);
CREATE INDEX IF NOT EXISTS idx_daily_report_messages_sender_id ON daily_report_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_daily_report_attachments_report_id ON daily_report_attachments(report_id);
CREATE INDEX IF NOT EXISTS idx_daily_report_templates_project_id ON daily_report_templates(project_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_daily_reports_updated_at
    BEFORE UPDATE ON daily_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_report_templates_updated_at
    BEFORE UPDATE ON daily_report_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_reports
DROP POLICY IF EXISTS "Allow authenticated users to manage daily reports" ON daily_reports;
CREATE POLICY "Allow authenticated users to manage daily reports" ON daily_reports
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for daily_report_messages
DROP POLICY IF EXISTS "Allow authenticated users to manage daily report messages" ON daily_report_messages;
CREATE POLICY "Allow authenticated users to manage daily report messages" ON daily_report_messages
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for daily_report_attachments
DROP POLICY IF EXISTS "Allow authenticated users to manage daily report attachments" ON daily_report_attachments;
CREATE POLICY "Allow authenticated users to manage daily report attachments" ON daily_report_attachments
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for daily_report_categories
DROP POLICY IF EXISTS "Allow authenticated users to manage daily report categories" ON daily_report_categories;
CREATE POLICY "Allow authenticated users to manage daily report categories" ON daily_report_categories
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for daily_report_templates
DROP POLICY IF EXISTS "Allow authenticated users to manage daily report templates" ON daily_report_templates;
CREATE POLICY "Allow authenticated users to manage daily report templates" ON daily_report_templates
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert default categories
INSERT INTO daily_report_categories (name, description, color, icon) VALUES
('Construction Progress', 'Daily construction progress updates', '#10B981', 'hammer'),
('Safety & Quality', 'Safety incidents and quality control reports', '#F59E0B', 'shield'),
('Materials & Equipment', 'Material usage and equipment status', '#3B82F6', 'package'),
('Weather & Conditions', 'Weather conditions and site conditions', '#8B5CF6', 'cloud'),
('Labor & Workforce', 'Labor updates and workforce information', '#EF4444', 'users'),
('Delays & Issues', 'Project delays and issue reporting', '#F97316', 'alert-circle')
ON CONFLICT (name) DO NOTHING;

-- Insert default template
INSERT INTO daily_report_templates (project_id, template_name, template_content, is_default) VALUES
(NULL, 'Standard Daily Report Template', '{
  "sections": [
    {
      "title": "Work Summary",
      "fields": [
        {"name": "work_completed", "type": "textarea", "required": true, "label": "Work Completed Today"},
        {"name": "work_in_progress", "type": "textarea", "required": false, "label": "Work In Progress"},
        {"name": "work_scheduled", "type": "textarea", "required": false, "label": "Work Scheduled for Tomorrow"}
      ]
    },
    {
      "title": "Resources",
      "fields": [
        {"name": "materials_used", "type": "textarea", "required": false, "label": "Materials Used"},
        {"name": "equipment_used", "type": "textarea", "required": false, "label": "Equipment Used"},
        {"name": "total_workers", "type": "number", "required": true, "label": "Total Workers"}
      ]
    },
    {
      "title": "Progress & Quality",
      "fields": [
        {"name": "progress_percentage", "type": "number", "required": true, "label": "Progress Percentage", "min": 0, "max": 100},
        {"name": "quality_issues", "type": "textarea", "required": false, "label": "Quality Issues"},
        {"name": "safety_incidents", "type": "textarea", "required": false, "label": "Safety Incidents"}
      ]
    }
  ]
}', true)
ON CONFLICT DO NOTHING;

-- Create views for easier querying
CREATE OR REPLACE VIEW daily_reports_with_details AS
SELECT 
    dr.*,
    p.projectName,
    u.email as reporter_email,
    u.raw_user_meta_data->>'first_name' as reporter_first_name,
    u.raw_user_meta_data->>'last_name' as reporter_last_name,
    approver.email as approver_email,
    approver.raw_user_meta_data->>'first_name' as approver_first_name,
    approver.raw_user_meta_data->>'last_name' as approver_last_name,
    COUNT(drm.id) as message_count,
    COUNT(dra.id) as attachment_count
FROM daily_reports dr
LEFT JOIN project p ON dr.project_id = p.id
LEFT JOIN auth.users u ON dr.reporter_id = u.id
LEFT JOIN auth.users approver ON dr.approved_by = approver.id
LEFT JOIN daily_report_messages drm ON dr.id = drm.report_id
LEFT JOIN daily_report_attachments dra ON dr.id = dra.report_id
GROUP BY dr.id, p.projectName, u.email, u.raw_user_meta_data, approver.email, approver.raw_user_meta_data;

-- Create function to get reports by project and date range
CREATE OR REPLACE FUNCTION get_daily_reports_by_project(
    project_uuid UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    report_date DATE,
    work_summary TEXT,
    status TEXT,
    progress_percentage INTEGER,
    reporter_name TEXT,
    message_count BIGINT,
    attachment_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dr.id,
        dr.report_date,
        dr.work_summary,
        dr.status,
        dr.progress_percentage,
        CONCAT(u.raw_user_meta_data->>'first_name', ' ', u.raw_user_meta_data->>'last_name') as reporter_name,
        COUNT(DISTINCT drm.id) as message_count,
        COUNT(DISTINCT dra.id) as attachment_count
    FROM daily_reports dr
    LEFT JOIN auth.users u ON dr.reporter_id = u.id
    LEFT JOIN daily_report_messages drm ON dr.id = drm.report_id
    LEFT JOIN daily_report_attachments dra ON dr.id = dra.report_id
    WHERE dr.project_id = project_uuid
    AND (start_date IS NULL OR dr.report_date >= start_date)
    AND (end_date IS NULL OR dr.report_date <= end_date)
    GROUP BY dr.id, dr.report_date, dr.work_summary, dr.status, dr.progress_percentage, u.raw_user_meta_data
    ORDER BY dr.report_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to approve/reject reports
CREATE OR REPLACE FUNCTION update_report_status(
    report_uuid UUID,
    new_status TEXT,
    admin_user_id UUID,
    admin_notes TEXT DEFAULT NULL,
    rejected_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE daily_reports 
    SET 
        status = new_status,
        approved_by = admin_user_id,
        approved_at = CASE WHEN new_status = 'approved' THEN NOW() ELSE approved_at END,
        admin_notes = admin_notes,
        rejected_reason = rejected_reason,
        updated_at = NOW()
    WHERE id = report_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Verify setup
SELECT 'Daily reports database setup completed successfully!' as status;



