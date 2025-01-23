"use client";

import React from 'react';
import { AlertTriangle, Wind, Droplets } from 'lucide-react';
import { WeatherAlert } from '@/services/weather';
import { useWeather } from '@/contexts/WeatherContext';

interface WeatherRiskAssessmentProps {
  siteId: string;
}

interface RiskScoreDisplayProps {
  score: number;
  level: {
    level: 'Extreme' | 'High' | 'Moderate' | 'Low' | 'Minimal';
    color: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  };
}

interface ContributingFactorsProps {
  alerts: WeatherAlert[];
  precipitationProbability: number;
  windSpeed: string;
}

const RiskScoreDisplay: React.FC<RiskScoreDisplayProps> = ({ score, level }) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
      <AlertTriangle className="h-5 w-5 text-yellow-400" />
      Overall Risk Assessment
    </h3>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-white/60">Risk Level</span>
        <span className={`px-3 py-1 rounded-full text-sm ${
          level.color === 'red' ? 'bg-red-500/20 text-red-400' :
          level.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
          level.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
          level.color === 'green' ? 'bg-green-500/20 text-green-400' :
          'bg-blue-500/20 text-blue-400'
        }`}>
          {level.level}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Risk Score</span>
          <span>{score}/100</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              level.color === 'red' ? 'bg-red-500' :
              level.color === 'orange' ? 'bg-orange-500' :
              level.color === 'yellow' ? 'bg-yellow-500' :
              level.color === 'green' ? 'bg-green-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  </div>
);

const ContributingFactors: React.FC<ContributingFactorsProps> = ({
  alerts,
  precipitationProbability,
  windSpeed
}) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
    <h3 className="text-lg font-medium mb-3">Contributing Factors</h3>
    <div className="space-y-3">
      {/* Active Alerts */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <span>Active Alerts</span>
        </div>
        <span className="text-white/60">{alerts.length} active</span>
      </div>

      {/* Precipitation Risk */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-cyan-400" />
          <span>Precipitation Risk</span>
        </div>
        <span className="text-white/60">{precipitationProbability}% chance</span>
      </div>

      {/* Wind Risk */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-blue-400" />
          <span>Wind Risk</span>
        </div>
        <span className="text-white/60">{windSpeed}</span>
      </div>
    </div>
  </div>
);

export const WeatherRiskAssessment: React.FC<WeatherRiskAssessmentProps> = ({ siteId }) => {
  const { weatherData } = useWeather();
  const siteWeather = weatherData.get(siteId);

  if (!siteWeather) {
    return (
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <p className="text-white/60">No weather data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RiskScoreDisplay score={siteWeather.riskScore} level={siteWeather.riskLevel} />
      <ContributingFactors
        alerts={siteWeather.alerts}
        precipitationProbability={siteWeather.precipitationProbability}
        windSpeed={siteWeather.windSpeed}
      />
    </div>
  );
}; 