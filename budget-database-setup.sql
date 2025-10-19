-- Budget Management Database Setup
-- Run this in Supabase SQL Editor

-- 1. Budget Categories Table
CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES project(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,
    allocated_amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT REFERENCES auth.users(id)
);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES project(id) ON DELETE CASCADE,
    category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
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

-- 3. Change Orders Table
CREATE TABLE IF NOT EXISTS change_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES project(id) ON DELETE CASCADE,
    category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    change_order_number TEXT UNIQUE,
    reason TEXT NOT NULL,
    old_amount DECIMAL(15,2) NOT NULL,
    new_amount DECIMAL(15,2) NOT NULL,
    difference_amount DECIMAL(15,2) GENERATED ALWAYS AS (new_amount - old_amount) STORED,
    approved_by TEXT NOT NULL,
    approval_date DATE DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT REFERENCES auth.users(id)
);

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES project(id) ON DELETE CASCADE,
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
    payment_amount DECIMAL(15,2) NOT NULL,
    payment_date DATE,
    payment_method TEXT CHECK (payment_method IN ('check', 'wire_transfer', 'cash', 'credit_card', 'ach')),
    payment_reference TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'paid', 'failed')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by TEXT REFERENCES auth.users(id)
);

-- 5. Budget Milestones Table
CREATE TABLE IF NOT EXISTS budget_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES project(id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    milestone_description TEXT,
    allocated_budget DECIMAL(15,2) NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')) DEFAULT 'not_started',
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budget_categories_project_id ON budget_categories(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_status ON expenses(payment_status);
CREATE INDEX IF NOT EXISTS idx_change_orders_project_id ON change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_expense_id ON payments(expense_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_budget_milestones_project_id ON budget_milestones(project_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_budget_categories_updated_at
    BEFORE UPDATE ON budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_change_orders_updated_at
    BEFORE UPDATE ON change_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_milestones_updated_at
    BEFORE UPDATE ON budget_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget_categories
DROP POLICY IF EXISTS "Allow authenticated users to manage budget categories" ON budget_categories;
CREATE POLICY "Allow authenticated users to manage budget categories" ON budget_categories
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for expenses
DROP POLICY IF EXISTS "Allow authenticated users to manage expenses" ON expenses;
CREATE POLICY "Allow authenticated users to manage expenses" ON expenses
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for change_orders
DROP POLICY IF EXISTS "Allow authenticated users to manage change orders" ON change_orders;
CREATE POLICY "Allow authenticated users to manage change orders" ON change_orders
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for payments
DROP POLICY IF EXISTS "Allow authenticated users to manage payments" ON payments;
CREATE POLICY "Allow authenticated users to manage payments" ON payments
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for budget_milestones
DROP POLICY IF EXISTS "Allow authenticated users to manage budget milestones" ON budget_milestones;
CREATE POLICY "Allow authenticated users to manage budget milestones" ON budget_milestones
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert sample data
INSERT INTO budget_categories (project_id, category_name, allocated_amount, description) VALUES
((SELECT id FROM project LIMIT 1), 'Labor', 1200000, 'Construction labor costs'),
((SELECT id FROM project LIMIT 1), 'Materials', 800000, 'Construction materials and supplies'),
((SELECT id FROM project LIMIT 1), 'Equipment', 400000, 'Equipment rental and maintenance'),
((SELECT id FROM project LIMIT 1), 'Subcontractors', 600000, 'Third-party contractor services'),
((SELECT id FROM project LIMIT 1), 'Permits', 50000, 'Building permits and regulatory fees'),
((SELECT id FROM project LIMIT 1), 'Miscellaneous', 100000, 'Other project-related expenses')
ON CONFLICT DO NOTHING;

-- Create views for easier querying
CREATE OR REPLACE VIEW budget_summary AS
SELECT 
    p.id as project_id,
    p.projectName,
    COALESCE(SUM(bc.allocated_amount), 0) as total_allocated,
    COALESCE(SUM(e.amount), 0) as total_spent,
    COALESCE(SUM(bc.allocated_amount), 0) - COALESCE(SUM(e.amount), 0) as remaining,
    CASE 
        WHEN COALESCE(SUM(bc.allocated_amount), 0) > 0 
        THEN (COALESCE(SUM(e.amount), 0) / COALESCE(SUM(bc.allocated_amount), 0)) * 100 
        ELSE 0 
    END as percentage_used
FROM project p
LEFT JOIN budget_categories bc ON p.id = bc.project_id
LEFT JOIN expenses e ON p.id = e.project_id
GROUP BY p.id, p.projectName;

-- Create function to calculate budget variance
CREATE OR REPLACE FUNCTION calculate_budget_variance(project_uuid UUID)
RETURNS TABLE (
    category_name TEXT,
    allocated_amount DECIMAL,
    spent_amount DECIMAL,
    variance DECIMAL,
    variance_percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bc.category_name,
        bc.allocated_amount,
        COALESCE(SUM(e.amount), 0) as spent_amount,
        bc.allocated_amount - COALESCE(SUM(e.amount), 0) as variance,
        CASE 
            WHEN bc.allocated_amount > 0 
            THEN ((bc.allocated_amount - COALESCE(SUM(e.amount), 0)) / bc.allocated_amount) * 100 
            ELSE 0 
        END as variance_percentage
    FROM budget_categories bc
    LEFT JOIN expenses e ON bc.id = e.category_id
    WHERE bc.project_id = project_uuid
    GROUP BY bc.id, bc.category_name, bc.allocated_amount
    ORDER BY bc.category_name;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Verify setup
SELECT 'Budget management database setup completed successfully!' as status;




