-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create weather_cache table
CREATE TABLE IF NOT EXISTS weather_cache (
    id BIGSERIAL PRIMARY KEY,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    weather_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Create index for spatial queries
    CONSTRAINT weather_cache_location_idx UNIQUE (location)
);

-- Create trigger for updated_at
CREATE TRIGGER update_weather_cache_updated_at
    BEFORE UPDATE ON weather_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for expired cache cleanup
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires_at
    ON weather_cache (expires_at);

-- Create spatial index for location queries
CREATE INDEX IF NOT EXISTS idx_weather_cache_location
    ON weather_cache USING GIST (location);

-- Add comment to table
COMMENT ON TABLE weather_cache IS 'Cached weather data from National Weather Service API';
