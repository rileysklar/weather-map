-- Create project_weather table for storing NOAA weather data
CREATE TABLE IF NOT EXISTS project_weather (
    id BIGSERIAL PRIMARY KEY,
    project_site_id UUID NOT NULL REFERENCES project_sites(id) ON DELETE CASCADE,
    weather_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_update TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '6 hours'),
    
    -- Ensure only one active weather record per project site
    CONSTRAINT unique_project_weather UNIQUE (project_site_id)
);

-- Create trigger for updated_at
CREATE TRIGGER update_project_weather_updated_at
    BEFORE UPDATE ON project_weather
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for cleanup of old data
CREATE INDEX IF NOT EXISTS idx_project_weather_next_update
    ON project_weather (next_update);

-- Add RLS policies
ALTER TABLE project_weather ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing weather data (allow all authenticated users to view)
CREATE POLICY "Allow viewing weather data"
    ON project_weather
    FOR SELECT
    USING (true);

-- Create policy for inserting/updating weather data (service role only - for cron job)
CREATE POLICY "Allow service role to manage weather data"
    ON project_weather
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Add comment to table
COMMENT ON TABLE project_weather IS 'NOAA weather data for project sites, updated every 6 hours'; 