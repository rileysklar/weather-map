'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import "../app/globals.css"
import LoadingScreen from './LoadingScreen';
import ProjectSiteForm from './ProjectSiteForm';
import { projectSitesService } from '@/services/projectSites';
import { Sidebar } from './Sidebar';
import { ProjectSitesList } from './ProjectSitesList';

if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('Mapbox token is required');
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Prevent multiple initializations during hot reloading
let mapInstance: mapboxgl.Map | null = null;

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const projectModeRef = useRef(false);
  const isDrawingRef = useRef(false);
  const currentPolygonRef = useRef<Array<{ id: string; coordinates: number[]; index: number }>>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Project site state
  const [isProjectMode, setIsProjectMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<Array<{ id: string; coordinates: number[]; index: number }>>([]);
  const [projectSites, setProjectSites] = useState<any[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(true);

  // Update refs when states change
  useEffect(() => {
    projectModeRef.current = isProjectMode;
    isDrawingRef.current = isDrawing;
    currentPolygonRef.current = currentPolygon;
  }, [isProjectMode, isDrawing, currentPolygon]);

  // Function to show weather popup
  const showWeatherPopup = async (lat: number, lng: number, locationName?: string) => {
    console.log('🌍 Attempting to show weather popup:', { isProjectMode: projectModeRef.current, lat, lng });
    if (!mapInstance || projectModeRef.current) {
      console.log('❌ Weather popup blocked:', { reason: projectModeRef.current ? 'Project Mode Active' : 'No Map Instance' });
      return;
    }

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
                        <span>${weatherData.weather[0].description.replace(/\b\w/g, (char: string) => char.toUpperCase())}</span>
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
  const handleSearch = async (searchQuery: string) => {
    if (!mapInstance || !searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxgl.accessToken}&types=place,region,country`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      if (!data.features || data.features.length === 0) {
        setError('No results found');
        return;
      }

      const [lng, lat] = data.features[0].center;
      const locationName = data.features[0].place_name;

      mapInstance.flyTo({
        center: [lng, lat],
        zoom: 10,
        duration: 2000,
        essential: true
      });

      // Show weather popup after flying
      setTimeout(() => {
        showWeatherPopup(lat, lng, locationName);
      }, 2000);

      setSearchValue('');
    } catch (err) {
      console.error('Search error:', err);
      setError('Error searching for location');
    } finally {
      setIsLoading(false);
    }
  };

  // Load project sites function
  const loadProjectSites = async () => {
    if (!mapInstance) return;
    const map = mapInstance as mapboxgl.Map;
    
    try {
      const sites = await projectSitesService.getAll();
      setProjectSites(sites);
      
      sites.forEach((site) => {
        const sourceId = `project-site-${site.id}`;
        
        // Remove existing layers and source if they exist
        if (map.getLayer(`${sourceId}-fill`)) {
          map.removeLayer(`${sourceId}-fill`);
        }
        if (map.getLayer(`${sourceId}-outline`)) {
          map.removeLayer(`${sourceId}-outline`);
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }

        // Add source and layers
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: site.polygon,
            properties: {
              id: site.id,
              name: site.name,
              description: site.description
            }
          }
        });

        // Add fill layer
        map.addLayer({
          id: `${sourceId}-fill`,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.2
          }
        });

        // Add outline layer
        map.addLayer({
          id: `${sourceId}-outline`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#3b82f6',
            'line-width': 2
          }
        });
      });
    } catch (error) {
      console.error('Error loading project sites:', error);
    } finally {
      setIsLoadingSites(false);
    }
  };

  // Handle project site submission
  const handleProjectSiteSubmit = async (data: { name: string; description: string; polygon: number[][] }) => {
    if (!mapInstance) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Ensure polygon is closed (first and last points match)
      const closedPolygon = [...data.polygon];
      if (closedPolygon[0][0] !== closedPolygon[closedPolygon.length - 1][0] || 
          closedPolygon[0][1] !== closedPolygon[closedPolygon.length - 1][1]) {
        closedPolygon.push(closedPolygon[0]);
      }

      // Create the project site in the database
      const newSite = await projectSitesService.create({
        name: data.name,
        description: data.description,
        polygon: {
          type: 'Polygon',
          coordinates: [closedPolygon]
        }
      });

      // Reset the map state
      handleProjectCancel();

      // Reload project sites to update the map and sidebar
      await loadProjectSites();

      // Fly to the new site
      handleProjectSiteClick(newSite);

    } catch (err) {
      console.error('Error creating project site:', err);
      setError('Failed to create project site. Please try again.');
      // Keep the form open if there's an error
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle map click for both weather and project site creation
  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!mapInstance) return;

    const { lng, lat } = e.lngLat;
    const currentPoints = currentPolygonRef.current;
    
    console.log('🖱️ Map clicked:', { 
      isProjectMode: projectModeRef.current, 
      isDrawing: isDrawingRef.current, 
      coordinates: [lng, lat],
      currentPolygonPoints: currentPoints.length 
    });

    // Project mode takes precedence over weather mode
    if (projectModeRef.current) {
      console.log('🎯 Project mode active');
      if (!isDrawingRef.current) {
        console.log('✏️ Drawing disabled');
        return;
      }
      
      // Add point to polygon with unique ID and sequential index
      const newPoint = {
        id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        coordinates: [lng, lat],
        index: currentPoints.length + 1
      };

      // Update polygon with new point
      const updatedPolygon = [...currentPoints, newPoint];
      currentPolygonRef.current = updatedPolygon; // Update ref immediately
      
      console.log('📍 Adding point to polygon:', { 
        pointNumber: newPoint.index,
        coordinates: [lng, lat],
        pointId: newPoint.id,
        totalPoints: updatedPolygon.length,
        currentPoints: currentPoints.length
      });

      // Update state with new polygon
      setCurrentPolygon(updatedPolygon);

      // Update or create the drawing layers
      const geojson = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [updatedPolygon.map(point => point.coordinates)]
        },
        properties: {}
      };

      // Add markers for each point
      const pointFeatures: GeoJSON.Feature[] = updatedPolygon.map(point => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: point.coordinates
        },
        properties: {
          id: point.id,
          index: point.index
        }
      }));

      // Update map layers
      if (!mapInstance.getSource('polygon-points')) {
        mapInstance.addSource('polygon-points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: pointFeatures
          }
        });

        mapInstance.addLayer({
          id: 'polygon-points',
          type: 'circle',
          source: 'polygon-points',
          paint: {
            'circle-radius': 6,
            'circle-color': '#3b82f6',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        mapInstance.addLayer({
          id: 'polygon-points-numbers',
          type: 'symbol',
          source: 'polygon-points',
          layout: {
            'text-field': ['get', 'index'],
            'text-size': 12,
            'text-offset': [0, -1]
          },
          paint: {
            'text-color': '#ffffff'
          }
        });
      } else {
        (mapInstance.getSource('polygon-points') as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: pointFeatures
        });
      }

      if (!mapInstance.getSource('polygon')) {
        mapInstance.addSource('polygon', {
          type: 'geojson',
          data: geojson as any
        });

        mapInstance.addLayer({
          id: 'polygon-fill',
          type: 'fill',
          source: 'polygon',
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.2
          }
        });

        mapInstance.addLayer({
          id: 'polygon-outline',
          type: 'line',
          source: 'polygon',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 2
          }
        });
      } else {
        (mapInstance.getSource('polygon') as mapboxgl.GeoJSONSource).setData(geojson as any);
      }
      return; // Exit early to prevent weather popup
    }
    
    // Only show weather if not in project mode
    showWeatherPopup(lat, lng);
  };

  // Handle project mode toggle
  const handleProjectModeToggle = () => {
    const newProjectMode = !projectModeRef.current;
    console.log('🔄 Toggling project mode:', { 
      currentMode: projectModeRef.current ? 'Project' : 'Weather',
      newMode: newProjectMode ? 'Project' : 'Weather'
    });

    // Update refs immediately
    projectModeRef.current = newProjectMode;
    isDrawingRef.current = newProjectMode;
    currentPolygonRef.current = []; // Reset polygon points

    // If we're already in project mode, cancel it
    if (!newProjectMode) {
      console.log('🚫 Canceling project mode');
      handleProjectCancel();
      return;
    }

    // Starting project mode
    console.log('✨ Starting project mode');
    setIsProjectMode(true);
    setIsDrawing(true);
    setCurrentPolygon([]);
    setError(null);
    
    // Clear any existing weather popups
    if (popupRef.current) {
      console.log('🧹 Clearing weather popup');
      popupRef.current.remove();
    }

    // Remove any existing polygon layers if they exist
    if (mapInstance) {
      if (mapInstance.getLayer('polygon-points-numbers')) {
        console.log('🗑️ Removing existing polygon points numbers layer');
        mapInstance.removeLayer('polygon-points-numbers');
      }
      if (mapInstance.getLayer('polygon-points')) {
        console.log('🗑️ Removing existing polygon points layer');
        mapInstance.removeLayer('polygon-points');
      }
      if (mapInstance.getLayer('polygon-fill')) {
        console.log('🗑️ Removing existing polygon fill layer');
        mapInstance.removeLayer('polygon-fill');
      }
      if (mapInstance.getLayer('polygon-outline')) {
        console.log('🗑️ Removing existing polygon outline layer');
        mapInstance.removeLayer('polygon-outline');
      }
      if (mapInstance.getSource('polygon-points')) {
        console.log('🗑️ Removing existing polygon points source');
        mapInstance.removeSource('polygon-points');
      }
      if (mapInstance.getSource('polygon')) {
        console.log('🗑️ Removing existing polygon source');
        mapInstance.removeSource('polygon');
      }
    }
  };

  // Handle project mode cancel
  const handleProjectCancel = () => {
    console.log('🔄 Canceling project mode');
    if (!mapInstance) return;

    // Clear all state and refs
    setCurrentPolygon([]);
    setIsDrawing(false);
    setIsProjectMode(false);
    projectModeRef.current = false;
    isDrawingRef.current = false;
    setError(null);

    console.log('🧹 Cleaning up polygon layers');
    // Remove drawing layers
    if (mapInstance.getLayer('polygon-points-numbers')) mapInstance.removeLayer('polygon-points-numbers');
    if (mapInstance.getLayer('polygon-points')) mapInstance.removeLayer('polygon-points');
    if (mapInstance.getLayer('polygon-fill')) mapInstance.removeLayer('polygon-fill');
    if (mapInstance.getLayer('polygon-outline')) mapInstance.removeLayer('polygon-outline');
    if (mapInstance.getSource('polygon-points')) mapInstance.removeSource('polygon-points');
    if (mapInstance.getSource('polygon')) mapInstance.removeSource('polygon');
  };

  // Handle project site click
  const handleProjectSiteClick = (site: any) => {
    if (!mapInstance) return;

    // Close any open popups
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Calculate the bounds of the polygon
    const coordinates = site.polygon.coordinates[0];
    const bounds = coordinates.reduce(
      (bounds: mapboxgl.LngLatBounds, coord: number[]) => {
        return bounds.extend(coord as [number, number]);
      },
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    );

    // Fly to the bounds
    mapInstance.fitBounds(bounds, {
      padding: 50,
      duration: 2000
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/rileysklar1/cm6374obn005d01s6eas16xay',
      center: [-97.7431, 30.2672], // Center on Austin, TX
      zoom: 9,
      minZoom: 3,
      maxZoom: 20,
      preserveDrawingBuffer: true
    });

    // Add click handler
    map.on('click', handleMapClick);
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      mapInstance = map;
      // Load project sites after map is initialized
      loadProjectSites();
      
      // Ensure loading screen shows for at least 3 seconds
      setTimeout(() => {
        setIsMapLoaded(true);
      }, 3000);
    });

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
      map.remove();
      mapInstance = null;
    };
  }, []); // Empty dependency array

  // Load initial project sites
  useEffect(() => {
    if (mapInstance && isMapLoaded) {
      loadProjectSites();
    }
  }, [isMapLoaded]);

  return (
    <>
      {!isMapLoaded && <LoadingScreen />}
      <div className="fixed inset-0 w-full h-full">
        <Sidebar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearch={handleSearch}
          isLoading={isLoading}
          error={error}
          isProjectMode={isProjectMode}
          isDrawing={isDrawing}
          currentPolygon={currentPolygon}
          onProjectModeToggle={handleProjectModeToggle}
          onProjectSiteSubmit={handleProjectSiteSubmit}
          onProjectCancel={handleProjectCancel}
          projectSites={projectSites}
          isLoadingSites={isLoadingSites}
          onProjectSiteClick={handleProjectSiteClick}
        />
        <div ref={mapContainer} className="w-full h-full" style={{ position: 'absolute' }} />
      </div>
    </>
  );
} 