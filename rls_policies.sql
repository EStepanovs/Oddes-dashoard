-- Option 2: Keep RLS enabled but add policies for authenticated users
-- Run this SQL if you want to keep Row Level Security with proper access

-- First, enable RLS on the table (if not already enabled)
ALTER TABLE data_by_roberts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to SELECT all data
CREATE POLICY "Allow authenticated users to read data" ON data_by_roberts
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Optional: Allow authenticated users to insert/update/delete as well
CREATE POLICY "Allow authenticated users to insert data" ON data_by_roberts  
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update data" ON data_by_roberts
    FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete data" ON data_by_roberts
    FOR DELETE 
    TO authenticated 
    USING (true);