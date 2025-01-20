-- Enable Row Level Security
ALTER TABLE project_sites ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Allow anonymous select" ON project_sites
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous insert" ON project_sites
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON project_sites
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous delete" ON project_sites
    FOR DELETE
    TO anon
    USING (true);

-- Grant necessary permissions to anon role
GRANT ALL ON project_sites TO anon; 