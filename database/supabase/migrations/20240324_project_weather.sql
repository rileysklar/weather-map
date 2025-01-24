-- Create weather_data table
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES project_sites(id) ON DELETE CASCADE,
    temperature NUMERIC NOT NULL,
    precipitation_probability NUMERIC NOT NULL,
    wind_speed TEXT NOT NULL,
    alerts JSONB NOT NULL DEFAULT '[]',
    risk_score NUMERIC NOT NULL,
    risk_level TEXT NOT NULL,
    risk_color TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_weather_data_updated_at
    BEFORE UPDATE ON weather_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_weather_data_site_id ON weather_data(site_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_created_at ON weather_data(created_at);

-- Enable RLS
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous users
CREATE POLICY "Allow anonymous select weather_data" ON weather_data
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous insert weather_data" ON weather_data
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous update weather_data" ON weather_data
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous delete weather_data" ON weather_data
    FOR DELETE
    TO anon
    USING (true);

-- Grant permissions
GRANT ALL ON weather_data TO anon; 