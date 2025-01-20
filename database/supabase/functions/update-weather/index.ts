import { serve } from 'https://deno.fresh.dev/std@v1.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types from weather.ts
interface WeatherPoint {
  properties: {
    forecast: string;
    gridId: string;
    gridX: number;
    gridY: number;
  }
}

interface WeatherForecast {
  properties: {
    periods: Array<{
      number: number;
      name: string;
      startTime: string;
      endTime: string;
      temperature: number;
      temperatureUnit: string;
      probabilityOfPrecipitation: {
        value: number | null;
      };
      relativeHumidity: {
        value: number | null;
      };
      windSpeed: string;
      windDirection: string;
      shortForecast: string;
      detailedForecast: string;
    }>;
  };
}

interface GridpointForecast {
  properties: {
    temperature: {
      values: Array<{
        validTime: string;
        value: number;
      }>;
    };
    probabilityOfPrecipitation: {
      values: Array<{
        validTime: string;
        value: number;
      }>;
    };
    hazards: {
      values: Array<{
        validTime: string;
        value: Array<{
          phenomenon: string;
          significance: string;
          event_number?: number;
        }>;
      }>;
    };
  };
}

// Weather service configuration
const BASE_URL = 'https://api.weather.gov'
const headers = {
  'User-Agent': '(poltimap.com, contact@poltimap.com)',
  'Accept': 'application/geo+json'
}

// Helper functions from weather.ts
async function getPoint(lat: number, lon: number): Promise<WeatherPoint> {
  const roundedLat = Number(lat.toFixed(4))
  const roundedLon = Number(lon.toFixed(4))
  
  const response = await fetch(
    `${BASE_URL}/points/${roundedLat},${roundedLon}`,
    { headers }
  )
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`)
  }
  
  return await response.json()
}

async function getForecast(forecastUrl: string): Promise<WeatherForecast> {
  const response = await fetch(forecastUrl, { headers })
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`)
  }
  
  return await response.json()
}

async function getGridpointForecast(gridId: string, gridX: number, gridY: number): Promise<GridpointForecast> {
  const response = await fetch(
    `${BASE_URL}/gridpoints/${gridId}/${gridX},${gridY}`,
    { headers }
  )
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`)
  }
  
  return await response.json()
}

async function getWeatherData(lat: number, lon: number, siteName: string) {
  // Step 1: Get the weather point data
  const pointData = await getPoint(lat, lon)
  
  // Step 2: Get the forecast using the URL from the point data
  const forecast = await getForecast(pointData.properties.forecast)
  
  // Step 3: Get the detailed gridpoint data
  const gridpoint = await getGridpointForecast(
    pointData.properties.gridId,
    pointData.properties.gridX,
    pointData.properties.gridY
  )
  
  return {
    forecast: forecast.properties.periods,
    gridpoint: gridpoint.properties,
    point: pointData.properties
  }
}

// Get centroid of a GeoJSON polygon
function getPolygonCentroid(polygon: any): [number, number] {
  const coordinates = polygon.coordinates[0]
  const length = coordinates.length - 1 // Subtract 1 because first and last points are the same
  
  let [sumX, sumY] = coordinates.reduce(([accX, accY], [x, y]: number[]) => {
    return [accX + x, accY + y]
  }, [0, 0])
  
  return [sumX / length, sumY / length]
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get sites that need weather updates
    const { data: sites, error: sitesError } = await supabaseClient
      .rpc('get_sites_needing_weather_updates')
    
    if (sitesError) throw sitesError
    
    // Update weather data for each site
    for (const site of sites) {
      try {
        // Get centroid of site polygon for weather lookup
        const [lon, lat] = getPolygonCentroid(site.site_polygon)
        
        // Get weather data
        const weatherData = await getWeatherData(lat, lon, site.site_id)
        
        // Update site weather in database
        const { error: updateError } = await supabaseClient
          .rpc('update_site_weather', {
            site_id: site.site_id,
            weather_data: weatherData
          })
        
        if (updateError) throw updateError
        
      } catch (error) {
        console.error(`Error updating weather for site ${site.site_id}:`, error)
        // Continue with next site even if one fails
        continue
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      sites_updated: sites.length 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Error in weather update function:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}) 