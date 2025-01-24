// Follow Supabase Edge Function standards
import { serve } from "http/server"
import { createClient } from "supabase"

// Deno types
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

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

interface WeatherAlert {
  site: string;
  validTime: string;
  type: 'Warning' | 'Watch' | 'Advisory' | 'Statement';
  phenomenon: string;
  description: string;
}

// Hazard significance mapping
const hazardTypes = {
  'W': 'Warning',
  'A': 'Watch',
  'Y': 'Advisory',
  'S': 'Statement'
} as const;

// Common weather phenomena mapping
const phenomenaDescriptions: { [key: string]: string } = {
  'AF': 'Ashfall',
  'AS': 'Air Stagnation',
  'BS': 'Blowing Snow',
  'BW': 'Brisk Wind',
  'BZ': 'Blizzard',
  'CF': 'Coastal Flood',
  // ... rest of the phenomena descriptions
};

function getPhenomenonDescription(code: string): string {
  return phenomenaDescriptions[code] || code;
}

function parseHazards(siteName: string, hazards: GridpointForecast['properties']['hazards']): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  hazards.values.forEach(hazard => {
    hazard.value.forEach(value => {
      const type = hazardTypes[value.significance as keyof typeof hazardTypes];
      if (type) {
        alerts.push({
          site: siteName,
          validTime: hazard.validTime,
          type,
          phenomenon: value.phenomenon,
          description: getPhenomenonDescription(value.phenomenon)
        });
      }
    });
  });

  return alerts;
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

  // Step 4: Parse hazards into alerts
  const alerts = parseHazards(siteName, gridpoint.properties.hazards);
  
  const weatherData = {
    forecast: forecast.properties.periods,
    gridpoint: gridpoint.properties,
    point: pointData.properties,
    alerts
  };

  console.log('Weather data for site:', siteName);
  console.log('Alerts:', alerts);
  console.log('Forecast periods:', weatherData.forecast.length);
  
  return weatherData;
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
    console.log('Starting weather update function...');
    
    // Log environment variables (redacted)
    console.log('DB_URL:', Deno.env.get('DB_URL')?.replace(/[^\/]+$/, '[redacted]'));
    console.log('Has DB_KEY:', !!Deno.env.get('DB_KEY'));
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('DB_URL') ?? '',
      Deno.env.get('DB_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    )

    // First check if we have any project sites at all
    const { data: allSites, error: allSitesError } = await supabaseClient
      .from('project_sites')
      .select('*');

    if (allSitesError) {
      console.error('Error fetching all sites:', allSitesError);
      throw allSitesError;
    }

    console.log('All project sites:', allSites);

    console.log('Fetching sites that need weather updates...');
    
    // Get sites that need weather updates
    const { data: sites, error: sitesError } = await supabaseClient
      .rpc('get_sites_needing_weather_updates')
    
    if (sitesError) {
      console.error('Error fetching sites:', sitesError);
      throw sitesError;
    }

    console.log('Found sites needing updates:', sites);
    
    // Update weather data for each site
    for (const site of sites) {
      try {
        console.log('Processing site:', site);
        
        // Get centroid of site polygon for weather lookup
        const [lon, lat] = getPolygonCentroid(site.site_polygon)
        console.log('Site coordinates:', { lat, lon });
        
        // Get weather data
        const weatherData = await getWeatherData(lat, lon, site.site_id)
        
        console.log('Got weather data, updating database...');
        
        // Update site weather in database
        const { error: updateError } = await supabaseClient
          .rpc('update_site_weather', {
            site_id: site.site_id,
            weather_data: weatherData
          })
        
        if (updateError) {
          console.error('Error updating weather:', updateError);
          throw updateError;
        }
        
        console.log('Successfully updated weather for site:', site.site_id);
        
      } catch (error) {
        console.error(`Error updating weather for site ${site.site_id}:`, error)
        // Continue with next site even if one fails
        continue
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      sites_updated: sites.length,
      total_sites: allSites?.length ?? 0
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