interface WeatherPoint {
  properties: {
    forecast: string;
    forecastHourly: string;
    gridId: string;
    gridX: number;
    gridY: number;
  };
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

export interface WeatherAlert {
  type: 'Warning' | 'Watch' | 'Advisory' | 'Statement';
  description: string;
  site: string;
  event: string;
  severity: string;
  certainty: string;
  urgency: string;
  onset: string;
  ends: string;
  instruction?: string;
  phenomenon: string;
}

class WeatherService {
  private readonly BASE_URL = 'https://api.weather.gov';
  private readonly headers = {
    'User-Agent': '(poltimap.com, contact@poltimap.com)',
    'Accept': 'application/geo+json'
  };

  // Hazard significance mapping
  private readonly hazardTypes = {
    'W': 'Warning',
    'A': 'Watch',
    'Y': 'Advisory',
    'S': 'Statement'
  } as const;

  // Common weather phenomena mapping
  private readonly phenomenaDescriptions: { [key: string]: string } = {
    'AF': 'Ashfall',
    'AS': 'Air Stagnation',
    'BS': 'Blowing Snow',
    'BW': 'Brisk Wind',
    'BZ': 'Blizzard',
    'CF': 'Coastal Flood',
    'CW': 'Cold Wind Chill',
    'DS': 'Dust Storm',
    'EC': 'Extreme Cold',
    'EH': 'Excessive Heat',
    'EW': 'Extreme Wind',
    'FA': 'Areal Flood',
    'FF': 'Flash Flood',
    'FG': 'Dense Fog',
    'FL': 'Flood',
    'FR': 'Frost',
    'FW': 'Fire Weather',
    'FZ': 'Freeze',
    'GL': 'Gale',
    'HF': 'Hurricane Force Wind',
    'HI': 'Inland Hurricane',
    'HS': 'Heavy Snow',
    'HT': 'Heat',
    'HU': 'Hurricane',
    'HW': 'High Wind',
    'HY': 'Hydrologic',
    'IS': 'Ice Storm',
    'LE': 'Lake Effect Snow',
    'LO': 'Low Water',
    'LS': 'Lakeshore Flood',
    'LW': 'Lake Wind',
    'MA': 'Marine',
    'RB': 'Small Craft for Rough Bar',
    'SB': 'Snow and Blowing Snow',
    'SC': 'Small Craft',
    'SE': 'Hazardous Seas',
    'SI': 'Small Craft for Winds',
    'SM': 'Dense Smoke',
    'SN': 'Snow',
    'SR': 'Storm',
    'SU': 'High Surf',
    'SV': 'Severe Thunderstorm',
    'SW': 'Small Craft for Hazardous Seas',
    'TO': 'Tornado',
    'TR': 'Tropical Storm',
    'TS': 'Tsunami',
    'TY': 'Typhoon',
    'UP': 'Heavy Freezing Spray',
    'WC': 'Wind Chill',
    'WI': 'Wind',
    'WS': 'Winter Storm',
    'WW': 'Winter Weather',
    'ZF': 'Freezing Fog',
    'ZR': 'Freezing Rain'
  };

  /**
   * Get the description for a weather phenomenon code
   */
  private getPhenomenonDescription(code: string): string {
    return this.phenomenaDescriptions[code] || code;
  }

  /**
   * Parse hazard data into a more usable format
   */
  parseHazards(siteName: string, hazards: GridpointForecast['properties']['hazards']): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];

    hazards.values.forEach(hazard => {
      hazard.value.forEach(value => {
        const type = this.hazardTypes[value.significance as keyof typeof this.hazardTypes];
        if (type) {
          // Parse the validTime string which is in format "2024-05-10T12:00:00+00:00/2024-05-11T00:00:00+00:00"
          const [onset, ends] = hazard.validTime.split('/');
          
          alerts.push({
            site: siteName,
            type,
            phenomenon: value.phenomenon,
            description: this.getPhenomenonDescription(value.phenomenon),
            event: this.getPhenomenonDescription(value.phenomenon),
            // Default values for severity, certainty, and urgency based on type
            severity: type === 'Warning' ? 'Severe' : type === 'Watch' ? 'Moderate' : 'Minor',
            certainty: 'Likely',
            urgency: type === 'Warning' ? 'Immediate' : type === 'Watch' ? 'Expected' : 'Future',
            onset: onset,
            ends: ends || onset, // If no end time, use onset time
            instruction: `Take appropriate precautions for ${this.getPhenomenonDescription(value.phenomenon).toLowerCase()}.`
          });
        }
      });
    });

    return alerts;
  }

  /**
   * Get the weather point data for a specific latitude/longitude
   */
  async getPoint(lat: number, lon: number): Promise<WeatherPoint> {
    try {
      // Round coordinates to 4 decimal places as per API requirements
      const roundedLat = Number(lat.toFixed(4));
      const roundedLon = Number(lon.toFixed(4));
      
      const response = await fetch(
        `${this.BASE_URL}/points/${roundedLat},${roundedLon}`,
        { headers: this.headers }
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch weather point: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get the forecast for a specific grid point
   */
  async getForecast(forecastUrl: string): Promise<WeatherForecast> {
    try {
      const response = await fetch(forecastUrl, { headers: this.headers });
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch forecast: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get detailed gridpoint data including hazards and probabilities
   */
  async getGridpointForecast(gridId: string, gridX: number, gridY: number): Promise<GridpointForecast> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/gridpoints/${gridId}/${gridX},${gridY}`,
        { headers: this.headers }
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch gridpoint forecast: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get complete weather data for a location
   */
  async getWeatherData(lat: number, lon: number, siteName: string) {
    try {
      // Step 1: Get the weather point data
      const pointData = await this.getPoint(lat, lon);
      
      // Step 2: Get the forecast using the URL from the point data
      const forecast = await this.getForecast(pointData.properties.forecast);
      
      // Step 3: Get the detailed gridpoint data
      const gridpoint = await this.getGridpointForecast(
        pointData.properties.gridId,
        pointData.properties.gridX,
        pointData.properties.gridY
      );

      // Parse hazards into a more usable format
      const alerts = this.parseHazards(siteName, gridpoint.properties.hazards);
      
      return {
        forecast: forecast.properties.periods,
        gridpoint: gridpoint.properties,
        point: pointData.properties,
        alerts
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch weather data: ${error.message}`);
      }
      throw error;
    }
  }
}

export const weatherService = new WeatherService(); 