import { NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

if (!OPENWEATHER_API_KEY) {
  throw new Error('OpenWeather API key is required');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    console.log('🌤️ Weather API request for:', { lat, lon });

    if (!lat || !lon) {
      console.error('❌ Missing coordinates:', { lat, lon });
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`;
    console.log('📡 Fetching from OpenWeather API:', url.replace(OPENWEATHER_API_KEY || '', '[API_KEY]'));

    const response = await fetch(url);
    console.log('📡 OpenWeather API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenWeather API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Weather data received:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in weather API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
} 