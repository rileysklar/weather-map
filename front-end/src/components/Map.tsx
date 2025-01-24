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
import { WeatherPopup } from './WeatherPopup';
import { createRoot } from 'react-dom/client';
import { weatherService, WeatherAlert } from '@/services/weather';
import { weatherDatabaseService } from '@/services/weatherDatabase';

if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('Mapbox token is required');
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Prevent multiple initializations during hot reloading
let mapInstance: mapboxgl.Map | null = null;

// Add type definition at the top of the file
interface ProjectSite {
  id: string;
  name: string;
  description: string;
  polygon: {
    type: "Polygon";
    coordinates: number[][][];
  };
  alerts?: WeatherAlert[];
}

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alertPreferences, setAlertPreferences] = useState({
    warnings: true,
    watches: true,
    advisories: true,
    statements: true
  });
  
  // Project site state
  const [isProjectMode, setIsProjectMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<Array<{ id: string; coordinates: number[]; index: number }>>([]);
  const [projectSites, setProjectSites] = useState<any[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [projectWeather, setProjectWeather] = useState<Array<{
    id: string;
    project_site_id: string;
    site_name: string;
    weather_data: {
      forecast?: {
        temperature: number;
        precipitation_probability: number;
        wind_speed: number;
      };
      alerts?: Array<{
        type: string;
        description: string;
        severity: string;
      }>;
    };
  }>>([]);

  // Update refs when states change
  useEffect(() => {
    projectModeRef.current = isProjectMode;
    isDrawingRef.current = isDrawing;
    currentPolygonRef.current = currentPolygon;
  }, [isProjectMode, isDrawing, currentPolygon]);

  // Function to show weather popup
  const showWeatherPopup = async (lat: number, lng: number, locationName?: string) => {
    console.log('🌍 Attempting to show weather popup:', { 
      isProjectMode: projectModeRef.current, 
      lat, 
      lng,
      mapInstance: !!mapInstance,
      popupRef: !!popupRef.current
    });

    if (!mapInstance || projectModeRef.current) {
      console.log('❌ Weather popup blocked:', { 
        reason: projectModeRef.current ? 'Project Mode Active' : 'No Map Instance',
        mapInstance: !!mapInstance,
        projectMode: projectModeRef.current
      });
      return;
    }

    try {
      // Remove existing popup if any
      if (popupRef.current) {
        console.log('🧹 Removing existing popup');
        popupRef.current.remove();
      }

      // Create new popup
      console.log('🎈 Creating new popup');
      popupRef.current = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '300px',
        offset: 15
      });

      // Create a temporary loading div
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'p-4 text-white';
      loadingDiv.textContent = 'Loading...';

      // Show loading state
      console.log('⏳ Showing loading state');
      popupRef.current
        .setLngLat([lng, lat])
        .setDOMContent(loadingDiv)
        .addTo(mapInstance);

      // Fetch weather data from OpenWeather API
      console.log('🌤️ Fetching weather data');
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lng}`);
      
      if (!response.ok) {
        console.error('❌ Weather API response not ok:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const weatherData = await response.json();
      console.log('✅ Weather data received:', weatherData);

      // Create container for React component
      console.log('🎨 Creating React component container');
      const container = document.createElement('div');
      const root = createRoot(container);

      // Render WeatherPopup component
      console.log('🎭 Rendering WeatherPopup component');
      root.render(
        <WeatherPopup 
          weatherData={weatherData}
          locationName={locationName}
          onCreateProjectSite={() => {
            // Close the popup
            popupRef.current?.remove();
            // Toggle project mode
            handleProjectModeToggle();
            // Start with empty polygon
            setCurrentPolygon([]);
          }}
        />
      );

      // Update popup content
      if (popupRef.current) {
        console.log('📝 Updating popup content');
        popupRef.current.setDOMContent(container);
      } else {
        console.warn('⚠️ Popup ref lost during weather data fetch');
      }
    } catch (error) {
      console.error('❌ Error in showWeatherPopup:', error);
      if (popupRef.current) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'p-4';
        const errorMessage = error instanceof Error && error.message.includes('outside the United States') 
          ? '⚠️ Weather alerts are only available for locations within the United States'
          : '⚠️ Weather data unavailable';
        errorDiv.innerHTML = `<p class="text-white">${errorMessage}</p>`;
        popupRef.current.setDOMContent(errorDiv);
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
        `/api/geocode?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        setError('No results found');
        return;
      }

      const location = data[0];
      const lng = location.lon;
      const lat = location.lat;
      const locationName = `${location.name}, ${location.state || ''} ${location.country}`.trim();

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
      const sites = await projectSitesService.getAll() as ProjectSite[];
      
      // Clear previous weather data
      setProjectWeather([]);
      
      // Fetch weather data for each site
      const sitesWithWeather = await Promise.all(sites.map(async (site) => {
        try {
          const [longitude, latitude] = site.polygon.coordinates[0][0];
          const weatherData = await weatherService.getWeatherData(latitude, longitude, site.name, site.id);
          
          // Add to project weather with generated ID and site name
          setProjectWeather(prev => [...prev, {
            id: `weather-${site.id}-${Date.now()}`,
            project_site_id: site.id,
            site_name: site.name,
            weather_data: {
              forecast: {
                temperature: weatherData.temperature,
                precipitation_probability: weatherData.precipitation_probability,
                wind_speed: parseInt(weatherData.wind_speed)
              },
              alerts: weatherData.alerts.map(alert => ({
                type: alert.type,
                description: alert.description,
                severity: alert.severity
              }))
            }
          }]);

          return { ...site, alerts: weatherData.alerts };
        } catch (error) {
          // Only log errors that aren't related to non-US locations
          if (!(error instanceof Error && error.message.includes('outside the United States'))) {
            console.error(`Failed to fetch weather data for site ${site.name}:`, error);
          } else {
            // For non-US locations, just log a debug message
            console.debug(`Site "${site.name}" is outside the US - skipping weather alerts`);
          }
          // Return site with empty alerts array
          return { ...site, alerts: [] };
        }
      }));

      setProjectSites(sitesWithWeather);
      
      // Create GeoJSON data for all sites
      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: sitesWithWeather.map(site => ({
          type: 'Feature' as const,
          geometry: site.polygon,
          properties: {
            id: site.id,
            name: site.name,
            description: site.description,
            hasAlerts: site.alerts && site.alerts.length > 0,
            alertText: site.alerts && site.alerts.length > 0 
              ? `${site.alerts[0].type}: ${site.alerts[0].description}`
              : ''
          }
        }))
      };

      // Add or update source and layers
      if (!map.getSource('project-sites')) {
        map.addSource('project-sites', {
          type: 'geojson',
          data: geojsonData
        });

        map.addLayer({
          id: 'project-sites',
          type: 'fill',
          source: 'project-sites',
          paint: {
            'fill-color': [
              'case',
              ['get', 'hasAlerts'], '#ff0000',
              '#0080ff'
            ],
            'fill-opacity': 0.5
          }
        });

        map.addLayer({
          id: 'project-sites-outline',
          type: 'line',
          source: 'project-sites',
          paint: {
            'line-color': '#000',
            'line-width': 1
          }
        });

        // Add layer for project site names
        map.addLayer({
          id: 'project-sites-labels',
          type: 'symbol',
          source: 'project-sites',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 14,  // Constant size regardless of zoom
            'text-anchor': 'center',
            'text-justify': 'center',
            'text-offset': [0, -0.5],
            'text-allow-overlap': true,
            'text-ignore-placement': true,
            'text-max-width': 20,
            'symbol-spacing': 1,
            'text-padding': 0,
            'symbol-z-order': 'viewport-y',  // Ensure labels are always on top
            'visibility': 'visible',
            'symbol-sort-key': ['get', 'name']
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 3,  // Increased halo for better visibility
            'text-opacity': 1
          },
          minzoom: 0,  // Show at all zoom levels
          maxzoom: 24
        });

        // Add layer for alert labels
        map.addLayer({
          id: 'project-sites-alerts',
          type: 'symbol',
          source: 'project-sites',
          layout: {
            'text-field': [
              'case',
              ['get', 'hasAlerts'], ['get', 'alertText'],
              ''
            ],
            'text-size': 10,  // Constant size for alert text
            'text-anchor': 'center',
            'text-justify': 'center',
            'text-offset': [0, 0.5],
            'text-allow-overlap': true,
            'text-ignore-placement': true,
            'text-max-width': 20,
            'symbol-spacing': 1,
            'text-padding': 0,
            'symbol-z-order': 'viewport-y',  // Ensure labels are always on top
            'visibility': 'visible',
            'symbol-sort-key': ['get', 'name']
          },
          paint: {
            'text-color': [
              'match',
              ['slice', ['get', 'alertText'], 0, ['index-of', ':', ['get', 'alertText']]],
              'Warning', '#dc2626',
              'Watch', '#ea580c',
              'Advisory', '#ca8a04',
              'Statement', '#2563eb',
              '#dc2626'  // default to red
            ],
            'text-halo-color': '#000000',
            'text-halo-width': 2,
            'text-opacity': 1
          },
          minzoom: 0,  // Show at all zoom levels
          maxzoom: 24
        });
      } else {
        // Update existing source with all sites
        const source = map.getSource('project-sites') as mapboxgl.GeoJSONSource;
        source.setData(geojsonData);
      }
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

      // Close the sidebar
      setIsSidebarOpen(false);

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

  // Function to remove map layers for a specific site
  const removeProjectSiteLayers = (siteId: string) => {
    if (!mapInstance) return;
    const map = mapInstance as mapboxgl.Map;
    const sourceId = `project-site-${siteId}`;

    // Remove layers first
    if (map.getLayer(`${sourceId}-fill`)) {
      map.removeLayer(`${sourceId}-fill`);
    }
    if (map.getLayer(`${sourceId}-outline`)) {
      map.removeLayer(`${sourceId}-outline`);
    }
    if (map.getLayer(`${sourceId}-alert-marker`)) {
      map.removeLayer(`${sourceId}-alert-marker`);
    }
    // Then remove source
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
  };

  // Handle project site deletion
  const handleProjectSiteDelete = async (siteId: string) => {
    // Remove map layers
    removeProjectSiteLayers(siteId);
    
    // Update project sites state
    setProjectSites(prevSites => prevSites.filter(site => site.id !== siteId));
    
    // Update project weather state
    setProjectWeather(prevWeather => prevWeather.filter(pw => pw.project_site_id !== siteId));

    // Reload project sites to ensure all components are in sync
    await loadProjectSites();
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
      
      // Load project sites
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

  // Update map cursor based on mode
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Remove existing classes first
    mapContainer.current.classList.remove('map-weather-mode', 'map-drawing-mode');
    
    // Add appropriate class based on mode
    if (isProjectMode && isDrawing) {
      mapContainer.current.classList.add('map-drawing-mode');
    } else if (!isProjectMode) {
      mapContainer.current.classList.add('map-weather-mode');
    }
  }, [isProjectMode, isDrawing]);

  // Cleanup cursor classes on unmount
  useEffect(() => {
    return () => {
      if (mapContainer.current) {
        mapContainer.current.classList.remove('map-weather-mode', 'map-drawing-mode');
      }
    };
  }, []);

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
          onProjectSiteDelete={handleProjectSiteDelete}
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          setProjectSites={setProjectSites}
          projectWeather={projectWeather}
          setProjectWeather={setProjectWeather}
          alertPreferences={alertPreferences}
          onNavigateToSite={(siteId) => {
            // Find the site
            const site = projectSites.find(s => s.id === siteId);
            if (site) {
              // Open the sidebar if it's closed
              setIsSidebarOpen(true);
              // Navigate to the site
              handleProjectSiteClick(site);
            }
          }}
        />
        <div ref={mapContainer} className="w-full h-full" style={{ position: 'absolute' }} />
      </div>
    </>
  );
} 