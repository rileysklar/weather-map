-- Create project_sites table
CREATE TABLE IF NOT EXISTS project_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    polygon JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_project_sites_updated_at
    BEFORE UPDATE ON project_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_project_sites_name ON project_sites(name);

-- Enable RLS and set up permissions
ALTER TABLE project_sites ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous users
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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON project_sites TO anon; 