-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create project_sites table
CREATE TABLE IF NOT EXISTS project_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    polygon JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Add constraint to ensure polygon is a valid GeoJSON Polygon
    CONSTRAINT valid_geojson CHECK (
        polygon ? 'type' 
        AND polygon->>'type' = 'Polygon'
        AND polygon ? 'coordinates'
        AND jsonb_typeof(polygon->'coordinates') = 'array'
    )
);

-- Create index for faster text search on name
CREATE INDEX idx_project_sites_name ON project_sites USING GIN (to_tsvector('english', name));

-- Create trigger for updated_at
CREATE TRIGGER update_project_sites_updated_at
    BEFORE UPDATE ON project_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE project_sites ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing project sites (allow all users to view)
CREATE POLICY "Allow viewing project sites"
    ON project_sites
    FOR SELECT
    USING (true);

-- Create policy for inserting project sites (authenticated users only)
CREATE POLICY "Allow inserting project sites"
    ON project_sites
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create policy for updating project sites (authenticated users only)
CREATE POLICY "Allow updating project sites"
    ON project_sites
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create policy for deleting project sites (authenticated users only)
CREATE POLICY "Allow deleting project sites"
    ON project_sites
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Add comment to table
COMMENT ON TABLE project_sites IS 'Project site geographical data with GeoJSON polygon information';
