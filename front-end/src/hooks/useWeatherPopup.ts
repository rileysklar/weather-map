'use client';

import { useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    country: string;
  };
}

export function useWeatherPopup(map: mapboxgl.Map | null) {
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const cleanup = () => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  };

  const showPopup = async (lat: number, lon: number, locationName?: string) => {
    if (!map) return;

    cleanup();

    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!response.ok) throw new Error('Failed to fetch weather data');
      
      const weatherData: WeatherData = await response.json();
      
      const popup = new mapboxgl.Popup({ 
        closeButton: true,
        closeOnClick: false,
        className: 'weather-popup',
        maxWidth: '400px',
        offset: 15
      });

      const content = `
        <div class="p-4 text-stone-800">
          <h3 class="text-lg font-semibold mb-2">Weather Conditions</h3>
          <table class="w-full text-sm">
            <tr>
              <td class="py-1 pr-4">Location</td>
              <td>${locationName || weatherData.name}${weatherData.sys.country ? `, ${weatherData.sys.country}` : ''}</td>
            </tr>
            <tr>
              <td class="py-1 pr-4">Coordinates</td>
              <td>${lat.toFixed(4)}°, ${lon.toFixed(4)}°</td>
            </tr>
            <tr>
              <td class="py-1 pr-4">Temperature</td>
              <td>${Math.round(weatherData.main.temp)}°C (Feels like ${Math.round(weatherData.main.feels_like)}°C)</td>
            </tr>
            <tr>
              <td class="py-1 pr-4">Humidity</td>
              <td>${weatherData.main.humidity}%</td>
            </tr>
            <tr>
              <td class="py-1 pr-4">Wind</td>
              <td>${Math.round(weatherData.wind.speed * 3.6)} km/h from ${weatherData.wind.deg}°</td>
            </tr>
          </table>
          <div class="mt-2 text-sm">
            <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(locationName || weatherData.name)}${weatherData.name.includes(',') ? '_' + weatherData.name.split(',')[1].trim() : ''}"
               target="_blank"
               rel="noopener noreferrer"
               class="text-blue-600 hover:text-blue-800 flex items-center gap-1"
               title="View on Wikipedia">
              📚 Wiki
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      `;

      popup
        .setLngLat([lon, lat])
        .setHTML(content)
        .addTo(map);

      popupRef.current = popup;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      const errorPopup = new mapboxgl.Popup({ 
        closeButton: true,
        closeOnClick: false,
        className: 'weather-popup',
        maxWidth: '300px'
      });

      errorPopup
        .setLngLat([lon, lat])
        .setHTML(`
          <div class="p-4">
            <p class="text-red-500">Failed to load weather data. Please try again.</p>
          </div>
        `)
        .addTo(map);

      popupRef.current = errorPopup;
    }
  };

  return { showPopup, cleanup };
} 