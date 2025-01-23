"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WeatherAlert } from '@/services/weather';
import { weatherService } from '@/services/weather';
import { weatherDatabaseService } from '@/services/weatherDatabase';
import { projectSitesService } from '@/services/projectSites';

type RiskLevel = 'Extreme' | 'High' | 'Moderate' | 'Low' | 'Minimal';
type RiskColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

interface ProjectSiteWeather {
  siteId: string;
  siteName: string;
  alerts: WeatherAlert[];
  precipitationProbability: number;
  windSpeed: string;
  riskScore: number;
  riskLevel: {
    level: RiskLevel;
    color: RiskColor;
  };
  lastUpdated: Date;
}

interface WeatherContextType {
  weatherData: Map<string, ProjectSiteWeather>;
  updateProjectSiteWeather: (siteId: string, siteName: string, lat: number, lon: number) => Promise<void>;
  deleteProjectSiteWeather: (siteId: string) => Promise<void>;
  getAllAlerts: () => WeatherAlert[];
  initializeWeatherData: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | null>(null);

const calculateRiskScore = (
  alerts: WeatherAlert[],
  precipitationProbability: number,
  windSpeed: string
): number => {
  let score = 0;
  
  alerts.forEach(alert => {
    switch (alert.type) {
      case 'Warning': score += 30; break;
      case 'Watch': score += 20; break;
      case 'Advisory': score += 10; break;
      case 'Statement': score += 5; break;
    }
  });

  if (precipitationProbability > 80) score += 20;
  else if (precipitationProbability > 60) score += 15;
  else if (precipitationProbability > 40) score += 10;
  else if (precipitationProbability > 20) score += 5;

  const windSpeedNum = parseInt(windSpeed);
  if (windSpeedNum > 30) score += 20;
  else if (windSpeedNum > 20) score += 15;
  else if (windSpeedNum > 10) score += 10;
  else if (windSpeedNum > 5) score += 5;

  return Math.min(score, 100);
};

const getRiskLevel = (score: number): { level: RiskLevel; color: RiskColor } => {
  if (score >= 80) return { level: 'Extreme', color: 'red' };
  if (score >= 60) return { level: 'High', color: 'orange' };
  if (score >= 40) return { level: 'Moderate', color: 'yellow' };
  if (score >= 20) return { level: 'Low', color: 'green' };
  return { level: 'Minimal', color: 'blue' };
};

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weatherData, setWeatherData] = useState<Map<string, ProjectSiteWeather>>(new Map());

  const initializeWeatherData = async () => {
    try {
      // Get all project sites
      const sites = await projectSitesService.getAll();
      
      // Get latest weather data for all sites
      const latestWeatherData = await weatherDatabaseService.getAllLatest();
      
      // Create a new map with the weather data
      const newWeatherData = new Map<string, ProjectSiteWeather>();
      
      latestWeatherData.forEach(data => {
        const site = sites.find(s => s.id === data.site_id);
        if (site) {
          newWeatherData.set(data.site_id, {
            siteId: data.site_id,
            siteName: site.name,
            alerts: data.alerts,
            precipitationProbability: data.precipitation_probability,
            windSpeed: data.wind_speed,
            riskScore: data.risk_score,
            riskLevel: {
              level: data.risk_level as RiskLevel,
              color: data.risk_color as RiskColor
            },
            lastUpdated: new Date(data.updated_at)
          });
        }
      });
      
      setWeatherData(newWeatherData);
    } catch (error) {
      console.error('Failed to initialize weather data:', error);
    }
  };

  const updateProjectSiteWeather = async (siteId: string, siteName: string, lat: number, lon: number) => {
    try {
      console.log(`🌤️ Fetching weather data for ${siteName} (${siteId}) at ${lat}, ${lon}`);
      
      const point = await weatherService.getPoint(lat, lon);
      console.log('📍 Got weather point:', point);
      
      const forecast = await weatherService.getForecast(point.properties.forecast);
      console.log('📅 Got forecast:', forecast);
      
      const gridpoint = await weatherService.getGridpointForecast(
        point.properties.gridId,
        point.properties.gridX,
        point.properties.gridY
      );
      console.log('🔲 Got gridpoint forecast:', gridpoint);

      const currentPeriod = forecast.properties.periods[0];
      const alerts = weatherService.parseHazards(siteName, gridpoint.properties.hazards);
      const precipProbability = currentPeriod.probabilityOfPrecipitation.value || 0;
      const riskScore = calculateRiskScore(alerts || [], precipProbability, currentPeriod.windSpeed);
      const riskLevel = getRiskLevel(riskScore);

      // Create weather data object
      const siteWeather: ProjectSiteWeather = {
        siteId,
        siteName,
        alerts: alerts || [],
        precipitationProbability: precipProbability,
        windSpeed: currentPeriod.windSpeed,
        riskScore,
        riskLevel,
        lastUpdated: new Date()
      };

      // Save to database
      await weatherDatabaseService.create({
        site_id: siteId,
        temperature: currentPeriod.temperature,
        precipitation_probability: precipProbability,
        wind_speed: currentPeriod.windSpeed,
        alerts: alerts || [],
        risk_score: riskScore,
        risk_level: riskLevel.level,
        risk_color: riskLevel.color
      });

      // Update local state
      setWeatherData(prev => {
        const newMap = new Map(prev);
        newMap.set(siteId, siteWeather);
        return newMap;
      });
    } catch (error) {
      console.error(`❌ Failed to update weather for site ${siteName}:`, error);
      throw error;
    }
  };

  const deleteProjectSiteWeather = async (siteId: string) => {
    try {
      // Delete from database
      await weatherDatabaseService.deleteBySiteId(siteId);
      
      // Update local state
      setWeatherData(prev => {
        const newMap = new Map(prev);
        newMap.delete(siteId);
        return newMap;
      });
    } catch (error) {
      console.error(`Failed to delete weather data for site ${siteId}:`, error);
      throw error;
    }
  };

  const getAllAlerts = (): WeatherAlert[] => {
    const allAlerts: WeatherAlert[] = [];
    weatherData.forEach(siteWeather => {
      if (siteWeather.alerts && Array.isArray(siteWeather.alerts)) {
        allAlerts.push(...siteWeather.alerts);
      }
    });
    return allAlerts;
  };

  // Initialize weather data on mount
  useEffect(() => {
    initializeWeatherData();
  }, []);

  return (
    <WeatherContext.Provider value={{
      weatherData,
      updateProjectSiteWeather,
      deleteProjectSiteWeather,
      getAllAlerts,
      initializeWeatherData
    }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}; 