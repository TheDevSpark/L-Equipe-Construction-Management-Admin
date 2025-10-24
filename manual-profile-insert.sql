-- MANUAL PROFILE INSERTION FUNCTION
-- Run this in Supabase SQL Editor

-- Create a function that can be called from your application
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    user_email TEXT,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    phone_number TEXT DEFAULT '',
    user_role TEXT DEFAULT 'admin'
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Insert or update the profile
    INSERT INTO profiles (id, email, first_name, last_name, phone_number, role, created_at, updated_at)
    VALUES (user_id, user_email, first_name, last_name, phone_number, user_role, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone_number = EXCLUDED.phone_number,
        role = EXCLUDED.role,
        updated_at = NOW();
    
    -- Return success message
    result := json_build_object(
        'success', true,
        'message', 'Profile created/updated successfully',
        'user_id', user_id
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return error message
        result := json_build_object(
            'success', false,
            'message', SQLERRM,
            'user_id', user_id
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT 'Function created successfully! You can now call create_user_profile() from your application.' as message;




