import React, { useState } from 'react';
import { AlertTriangle, Wind, Droplets, BarChart3, ChevronDown } from 'lucide-react';
import { WeatherAlert } from '@/services/weather';
import { useWeather } from '@/contexts/WeatherContext';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

interface ProjectWeather {
  id: string;
  project_site_id: string;
  site_name?: string;
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
}

interface RiskAssessmentProps {
  projectWeather?: ProjectWeather[];
  siteId?: string;
  onNavigateToSite?: (siteId: string) => void;
}

interface Alert {
  type: string;
  description: string;
  severity: string;
}

const calculateRiskScore = (
  alerts: Alert[],
  precipitationProbability: number,
  windSpeed: string
): { score: number; factors: { name: string; value: number; fullMark: number; }[] } => {
  let score = 0;
  let alertScore = 0;
  let precipScore = 0;
  let windScore = 0;
  
  // Calculate alert score
  alerts.forEach(alert => {
    switch (alert.type) {
      case 'Warning':
        alertScore += 30;
        break;
      case 'Watch':
        alertScore += 20;
        break;
      case 'Advisory':
        alertScore += 10;
        break;
      case 'Statement':
        alertScore += 5;
        break;
    }
  });

  // Calculate precipitation score
  if (precipitationProbability > 80) precipScore = 100;
  else if (precipitationProbability > 60) precipScore = 75;
  else if (precipitationProbability > 40) precipScore = 50;
  else if (precipitationProbability > 20) precipScore = 25;
  else precipScore = 10;

  // Calculate wind score
  const windSpeedNum = parseInt(windSpeed.split(' ')[0]);
  if (windSpeedNum > 30) windScore = 100;
  else if (windSpeedNum > 20) windScore = 75;
  else if (windSpeedNum > 10) windScore = 50;
  else if (windSpeedNum > 5) windScore = 25;
  else windScore = 10;

  // Calculate total score
  score = Math.min((alertScore + precipScore + windScore) / 3, 100);

  return {
    score,
    factors: [
      { name: 'Alerts', value: alertScore, fullMark: 100 },
      { name: 'Rain', value: precipScore, fullMark: 100 },
      { name: 'Wind', value: windScore, fullMark: 100 },
    ]
  };
};

const getRiskLevel = (score: number): { level: string; color: string } => {
  if (score >= 80) return { level: 'Extreme', color: 'red' };
  if (score >= 60) return { level: 'High', color: 'orange' };
  if (score >= 40) return { level: 'Moderate', color: 'yellow' };
  if (score >= 20) return { level: 'Low', color: 'green' };
  return { level: 'Minimal', color: 'blue' };
};

const SiteRiskAssessment: React.FC<{ weather: ProjectWeather }> = ({ weather }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const forecast = weather.weather_data.forecast;
  const alerts = weather.weather_data.alerts || [];
  
  if (!forecast) {
    return (
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <p className="text-white/60">No forecast data available</p>
      </div>
    );
  }

  const { score, factors } = calculateRiskScore(
    alerts,
    forecast.precipitation_probability,
    `${forecast.wind_speed} mph`
  );
  const riskLevel = getRiskLevel(score);

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 transition-colors ${
          isExpanded ? 'bg-white/10' : 'hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-2 text-left">
          <span className="font-medium text-white">{weather.site_name || `Site ${weather.project_site_id}`}</span>
          <span className={`px-2 py-1 rounded-full text-sm ${
            riskLevel.color === 'red' ? 'bg-red-500/20 text-red-400' :
            riskLevel.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
            riskLevel.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
            riskLevel.color === 'green' ? 'bg-green-500/20 text-green-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            {riskLevel.level}
          </span>
        </div>
        <ChevronDown
          className={`transform transition-transform text-white/60 ${isExpanded ? 'rotate-180' : ''}`}
          size={20}
        />
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-white/10 space-y-3">
          {/* Risk Score Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Risk Score</span>
              <span>{score.toFixed(1)}/100</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  riskLevel.color === 'red' ? 'bg-red-500' :
                  riskLevel.color === 'orange' ? 'bg-orange-500' :
                  riskLevel.color === 'yellow' ? 'bg-yellow-500' :
                  riskLevel.color === 'green' ? 'bg-green-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Risk Factors Radar Chart */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={factors}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                />
                <Radar
                  name="Risk Factors"
                  dataKey="value"
                  stroke={
                    riskLevel.color === 'red' ? '#ef4444' :
                    riskLevel.color === 'orange' ? '#f97316' :
                    riskLevel.color === 'yellow' ? '#eab308' :
                    riskLevel.color === 'green' ? '#22c55e' :
                    '#3b82f6'
                  }
                  fill={
                    riskLevel.color === 'red' ? 'rgba(239,68,68,0.2)' :
                    riskLevel.color === 'orange' ? 'rgba(249,115,22,0.2)' :
                    riskLevel.color === 'yellow' ? 'rgba(234,179,8,0.2)' :
                    riskLevel.color === 'green' ? 'rgba(34,197,94,0.2)' :
                    'rgba(59,130,246,0.2)'
                  }
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Contributing Factors */}
          <div className="space-y-2">
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
              <span className="text-white/60">
                {forecast.precipitation_probability}% chance
              </span>
            </div>

            {/* Wind Risk */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-blue-400" />
                <span>Wind Risk</span>
              </div>
              <span className="text-white/60">{forecast.wind_speed} mph</span>
            </div>
          </div>

          {/* Active Alerts List */}
          {alerts.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Active Alerts</h4>
              <div className="space-y-1">
                {[...new Set(alerts.map(alert => alert.description))].map((description, index) => {
                  const alert = alerts.find(a => a.description === description)!;
                  const expandedDescription = description
                    .replace(/\bAQ\b/g, 'Air Quality')
                    .replace(/\bTemp\b/g, 'Temperature');
                  
                  return (
                    <div 
                      key={index}
                      className={`text-xs px-2 py-1 rounded ${
                        alert.type === 'Warning' ? 'bg-red-500/20 text-red-400' :
                        alert.type === 'Watch' ? 'bg-orange-500/20 text-orange-400' :
                        alert.type === 'Advisory' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {expandedDescription}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RiskAssessment({ projectWeather, siteId, onNavigateToSite }: RiskAssessmentProps) {
  const { weatherData } = useWeather();
  
  // Function to find site ID by alert description
  const findSiteIdByAlert = (alertDescription: string) => {
    return projectWeather?.find(pw => 
      pw.weather_data.alerts?.some(a => a.description === alertDescription)
    )?.project_site_id;
  };

  // If siteId is provided, use WeatherContext data
  if (siteId) {
    const siteWeather = weatherData.get(siteId);
    
    if (!siteWeather) {
      return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-white/60">No weather data available</p>
        </div>
      );
    }

    // Convert WeatherContext data to ProjectWeather format
    const contextWeather: ProjectWeather = {
      id: siteId,
      project_site_id: siteId,
      site_name: siteWeather.siteName,
      weather_data: {
        forecast: {
          temperature: 0, // Not used in risk assessment
          precipitation_probability: siteWeather.precipitationProbability,
          wind_speed: parseInt(siteWeather.windSpeed)
        },
        alerts: siteWeather.alerts.map(alert => ({
          type: alert.type,
          description: alert.description,
          severity: alert.severity
        }))
      }
    };

    return <SiteRiskAssessment weather={contextWeather} />;
  }

  // If projectWeather is provided, show multiple site assessments
  if (projectWeather) {
    // Get all unique alerts across all sites
    const allAlerts = projectWeather.reduce<Array<{ description: string; type: string; siteId: string }>>((acc, pw) => {
      const siteAlerts = pw.weather_data.alerts?.map(alert => ({
        description: alert.description,
        type: alert.type,
        siteId: pw.project_site_id
      })) || [];
      return [...acc, ...siteAlerts];
    }, []);

    // Deduplicate alerts while keeping track of affected sites
    const uniqueAlerts = Array.from(new Set(allAlerts.map(a => a.description)))
      .map(desc => {
        const alert = allAlerts.find(a => a.description === desc)!;
        const affectedSites = allAlerts.filter(a => a.description === desc);
        return {
          ...alert,
          siteCount: affectedSites.length,
          siteIds: affectedSites.map(a => a.siteId)
        };
      });

    // Sort weather data by risk severity
    const sortedWeather = [...projectWeather].sort((a, b) => {
      const aForecast = a.weather_data.forecast;
      const bForecast = b.weather_data.forecast;
      
      if (!aForecast) return 1;  // No forecast data goes to bottom
      if (!bForecast) return -1; // No forecast data goes to bottom
      
      const aScore = calculateRiskScore(
        a.weather_data.alerts || [],
        aForecast.precipitation_probability,
        `${aForecast.wind_speed} mph`
      ).score;
      
      const bScore = calculateRiskScore(
        b.weather_data.alerts || [],
        bForecast.precipitation_probability,
        `${bForecast.wind_speed} mph`
      ).score;
      
      return bScore - aScore; // Higher scores first
    });

    return (
      <div className="space-y-4">
        {/* Individual Site Risk Assessments */}
        {sortedWeather.map((pw) => (
          <SiteRiskAssessment key={pw.id} weather={pw} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
      <p className="text-white/60">No weather data available</p>
    </div>
  );
} 