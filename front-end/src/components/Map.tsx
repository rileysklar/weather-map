'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import "../app/globals.css"
import LoadingScreen from './LoadingScreen';

if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('Mapbox token is required');
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Prevent multiple initializations during hot reloading
let mapInstance: mapboxgl.Map | null = null;

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Function to show weather popup
  const showWeatherPopup = async (lat: number, lng: number, locationName?: string) => {
    if (!mapInstance) return;

    try {
      // Remove existing popup if any
      if (popupRef.current) {
        popupRef.current.remove();
      }

      // Create new popup
      popupRef.current = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '300px',
        offset: 15
      });

      // Show loading state
      popupRef.current
        .setLngLat([lng, lat])
        .setHTML('<div class="p-4 text-white">⏳ Loading weather data...</div>')
        .addTo(mapInstance);

      // Fetch weather data
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lng}`);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const weatherData = await response.json();

      // Update popup with weather data
      const formatTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      };

      const html = `
        <div class="p-6 text-white">
          <h3 class="font-bold text-xl text-white border-b border-white/20 pb-2 flex items-center justify-between">
            <span>${locationName || weatherData.name || 'Location'}, ${weatherData.sys.country}</span>
            <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(locationName || weatherData.name)}${weatherData.name.includes(',') ? '_' + weatherData.name.split(',')[1].trim() : ''}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="text-blue-300 hover:text-blue-400 text-sm ml-2 flex items-center gap-1"
               title="View on Wikipedia">
              Wiki <svg class="w-3 h-3 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          </h3>
          <table class="w-full">
            <tbody class="divide-y divide-white/20">
              <tr>
                <td class="py-3 font-medium">Lat/Lon</td>
                <td class="py-3 text-right">${weatherData.coord.lat.toFixed(4)}°N, ${weatherData.coord.lon.toFixed(4)}°W</td>
              </tr>
              <tr>
                <td class="py-3 font-medium">Sunrise</td>
                <td class="py-3 text-right">${formatTime(weatherData.sys.sunrise)}</td>
              </tr>
              <tr>
                <td class="py-3 font-medium">Sunset</td>
                <td class="py-3 text-right">${formatTime(weatherData.sys.sunset)}</td>
              </tr>
              <tr>
                <td class="py-3 font-medium">Temperature</td>
                <td class="py-3 text-right">${Math.round(weatherData.main.temp)}°F (Feels like ${Math.round(weatherData.main.feels_like)}°F)</td>
              </tr>
              <tr>
                <td class="py-3 font-medium">Wind</td>
                <td class="py-3 text-right">${Math.round(weatherData.wind.speed)} mph ${weatherData.wind.gust ? `(Gusts ${Math.round(weatherData.wind.gust)} mph)` : ''}</td>
              </tr>
              <tr>
                <td colspan="2" class="py-3">
                  <details class="cursor-pointer">
                    <summary class="font-medium hover:text-blue-300">Detailed Conditions</summary>
                    <div class="mt-2 space-y-2 pl-4 border-l border-white/20">
                      <div class="flex justify-between">
                        <span>Humidity</span>
                        <span>${weatherData.main.humidity}%</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Pressure</span>
                        <span>${weatherData.main.pressure} hPa</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Visibility</span>
                        <span>${(weatherData.visibility / 1000).toFixed(1)} km</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Cloud Cover</span>
                        <span>${weatherData.clouds.all}%</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Conditions</span>
                        <span>${weatherData.weather[0].description.replace(/\b\w/g, char => char.toUpperCase())}</span>
                      </div>
                    </div>
                  </details>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      if (popupRef.current) {
        popupRef.current.setHTML(html);
      }
    } catch (error) {
      console.error('❌ Error fetching weather:', error);
      if (popupRef.current) {
        popupRef.current.setHTML(`
          <div class="p-4">
            <p class="text-white">⚠️ Weather data unavailable</p>
          </div>
        `);
      }
    }
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapInstance || !searchValue.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(searchValue)}`);

      if (!response.ok) {
        throw new Error('Failed to find location');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        setError('Location not found');
        return;
      }

      const { lat, lon: lng, name } = data[0];
      
      // Fly to location
      mapInstance.flyTo({
        center: [lng, lat],
        zoom: 10,
        duration: 2000,
        essential: true
      });

      // Show weather popup after flying
      setTimeout(() => {
        showWeatherPopup(lat, lng, name);
      }, 2000);

      setSearchValue('');
    } catch (err) {
      setError('Error searching for location');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/rileysklar1/cm6374obn005d01s6eas16xay',
      center: [-97.7431, 30.2672], // Center on Austin, TX
      zoom: 4,
      minZoom: 3,
      maxZoom: 15,
      preserveDrawingBuffer: true
    });

    // Add click handler
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      showWeatherPopup(lat, lng);
    };

    map.on('click', handleMapClick);
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Ensure loading screen shows for at least 3 seconds
      setTimeout(() => {
        setIsMapLoaded(true);
      }, 3000);
    });

    mapInstance = map;

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
      map.remove();
      mapInstance = null;
    };
  }, []); // Empty dependency array

  return (
    <>
      {!isMapLoaded && <LoadingScreen />}
      <div className="fixed inset-0 w-full h-full">
        <div className="absolute top-4 right-12 z-10 w-80 md:w-[32rem] lg:w-[40rem]">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e as any);
                }
              }}
              placeholder="Search for a location..."
              className="w-full px-4 py-2 md:py-3 lg:py-4 text-base md:text-lg rounded-lg bg-black/25 backdrop-blur-md border border-white/20 text-white placeholder:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-800 hover:text-blue-500 disabled:text-stone-400"
            >
              {isLoading ? '⏳' : '🔍'}
            </button>
          </form>
          {error && (
            <div className="mt-2 px-3 py-2 bg-red-100/80 backdrop-blur-md text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
        <div ref={mapContainer} className="w-full h-full" style={{ position: 'absolute' }} />
      </div>
    </>
  );
} 