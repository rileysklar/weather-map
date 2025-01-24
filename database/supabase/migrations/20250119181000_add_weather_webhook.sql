-- Create function to get sites needing weather updates
CREATE OR REPLACE FUNCTION get_sites_needing_weather_updates()
RETURNS TABLE (
    site_id UUID,
    site_polygon JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id as site_id,
        ps.polygon as site_polygon
    FROM project_sites ps
    LEFT JOIN project_weather pw ON ps.id = pw.project_site_id
    WHERE pw.id IS NULL  -- Sites with no weather data
    OR pw.next_update <= NOW();  -- Sites needing update
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update weather data (called by Edge Function)
CREATE OR REPLACE FUNCTION update_site_weather(
    site_id UUID,
    weather_data JSONB
)
RETURNS void AS $$
BEGIN
    INSERT INTO project_weather (
        project_site_id,
        weather_data,
        next_update
    ) 
    VALUES (
        site_id,
        weather_data,
        NOW() + INTERVAL '6 hours'
    )
    ON CONFLICT (project_site_id) 
    DO UPDATE SET 
        weather_data = EXCLUDED.weather_data,
        next_update = EXCLUDED.next_update,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 