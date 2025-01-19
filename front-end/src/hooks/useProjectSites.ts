'use client';

import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface ProjectSite {
  id: string;
  name: string;
  description: string;
  polygon: GeoJSON.Polygon;
  created_at: string;
  updated_at: string;
}

export function useProjectSites(map: mapboxgl.Map | null) {
  const [sites, setSites] = useState<ProjectSite[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<number[][]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load project sites from the database
  const loadProjectSites = async () => {
    try {
      const response = await fetch('/api/project-sites');
      if (!response.ok) throw new Error('Failed to load project sites');
      const data = await response.json();
      setSites(data);
      
      if (map) {
        // Remove existing layers and sources
        if (map.getLayer('project-sites-fill')) map.removeLayer('project-sites-fill');
        if (map.getLayer('project-sites-outline')) map.removeLayer('project-sites-outline');
        if (map.getSource('project-sites')) map.removeSource('project-sites');

        // Add new source and layers
        map.addSource('project-sites', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: data.map((site: ProjectSite) => ({
              type: 'Feature',
              geometry: site.polygon,
              properties: {
                id: site.id,
                name: site.name,
                description: site.description
              }
            }))
          }
        });

        map.addLayer({
          id: 'project-sites-fill',
          type: 'fill',
          source: 'project-sites',
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.2
          }
        });

        map.addLayer({
          id: 'project-sites-outline',
          type: 'line',
          source: 'project-sites',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 2
          }
        });
      }
    } catch (err) {
      console.error('Error loading project sites:', err);
      setError('Failed to load project sites');
    }
  };

  // Start drawing a new polygon
  const startDrawing = () => {
    setIsDrawing(true);
    setCurrentPolygon([]);
    if (map) {
      map.getCanvas().style.cursor = 'crosshair';
    }
  };

  // Add a point to the current polygon
  const addPoint = (lngLat: { lng: number; lat: number }) => {
    if (!isDrawing) return;
    setCurrentPolygon(prev => [...prev, [lngLat.lng, lngLat.lat]]);
  };

  // Finish drawing the polygon
  const finishDrawing = () => {
    setIsDrawing(false);
    if (map) {
      map.getCanvas().style.cursor = '';
    }
  };

  // Cancel drawing
  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPolygon([]);
    if (map) {
      map.getCanvas().style.cursor = '';
    }
  };

  // Load project sites when the map is ready
  useEffect(() => {
    if (map) {
      loadProjectSites();
    }
  }, [map]);

  // Update the drawing layer when the current polygon changes
  useEffect(() => {
    if (!map) return;

    // Remove existing drawing layers
    if (map.getLayer('drawing-fill')) map.removeLayer('drawing-fill');
    if (map.getLayer('drawing-outline')) map.removeLayer('drawing-outline');
    if (map.getSource('drawing')) map.removeSource('drawing');

    if (currentPolygon.length > 0) {
      // Create a closed polygon if there are at least 3 points
      const coordinates = currentPolygon.length >= 3 
        ? [...currentPolygon, currentPolygon[0]] 
        : currentPolygon;

      // Add the drawing source and layers
      map.addSource('drawing', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates
          },
          properties: {}
        }
      });

      if (currentPolygon.length >= 3) {
        map.addLayer({
          id: 'drawing-fill',
          type: 'fill',
          source: 'drawing',
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.1
          }
        });
      }

      map.addLayer({
        id: 'drawing-outline',
        type: 'line',
        source: 'drawing',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });
    }
  }, [map, currentPolygon]);

  return {
    sites,
    isDrawing,
    currentPolygon,
    setCurrentPolygon,
    error,
    startDrawing,
    addPoint,
    finishDrawing,
    cancelDrawing,
    loadProjectSites
  };
} 