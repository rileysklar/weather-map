import React from 'react';
import { Cloud, Droplets, Wind } from 'lucide-react';
import { WeatherAlert } from '@/services/weather';

interface WeatherPeriod {
  temperature: number;
  probabilityOfPrecipitation: {
    value: number | null;
  };
}

interface WeatherProperties {
  periods: WeatherPeriod[];
}

interface WeatherData {
  properties: WeatherProperties;
}

interface HistoricalWeatherDataProps {
  forecast: WeatherData;
  recentAlerts: WeatherAlert[];
}

interface TemperatureTrendsProps {
  avgTemp: number;
}

interface PrecipitationTrendsProps {
  avgPrecipProb: number;
}

interface RecentEventsProps {
  alerts: WeatherAlert[];
}

const TemperatureTrends: React.FC<TemperatureTrendsProps> = ({ avgTemp }) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
      <Cloud className="h-5 w-5 text-blue-400" />
      Temperature Trends
    </h3>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/60">Average Temperature</span>
        <span>{avgTemp.toFixed(1)}°</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${(avgTemp / 100) * 100}%` }}
        />
      </div>
    </div>
  </div>
);

const PrecipitationTrends: React.FC<PrecipitationTrendsProps> = ({ avgPrecipProb }) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
      <Droplets className="h-5 w-5 text-cyan-400" />
      Precipitation Trends
    </h3>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/60">Average Probability</span>
        <span>{avgPrecipProb.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
          style={{ width: `${avgPrecipProb}%` }}
        />
      </div>
    </div>
  </div>
);

const RecentEvents: React.FC<RecentEventsProps> = ({ alerts }) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
      <Wind className="h-5 w-5 text-purple-400" />
      Recent Events
    </h3>
    <div className="space-y-2">
      {alerts.length > 0 ? (
        alerts.map((alert, index) => (
          <div 
            key={`${alert.description}-${alert.type}-${index}`}
            className="flex justify-between items-center text-sm"
          >
            <span className="text-white/60">{new Date(alert.onset).toLocaleDateString()}</span>
            <span className={`px-2 py-1 rounded text-xs ${
              alert.type === 'Warning' ? 'bg-red-500/20 text-red-400' :
              alert.type === 'Watch' ? 'bg-orange-500/20 text-orange-400' :
              alert.type === 'Advisory' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {alert.description}
            </span>
          </div>
        ))
      ) : (
        <p className="text-sm text-white/60">No recent weather events.</p>
      )}
    </div>
  </div>
);

export const HistoricalWeatherData: React.FC<HistoricalWeatherDataProps> = ({ forecast, recentAlerts }) => {
  // Calculate temperature trends
  const temperatures = forecast.properties.periods.map(period => period.temperature);
  const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
  
  // Calculate precipitation probability trends
  const precipProbs = forecast.properties.periods.map(period => period.probabilityOfPrecipitation.value || 0);
  const avgPrecipProb = precipProbs.reduce((a, b) => a + b, 0) / precipProbs.length;

  return (
    <div className="space-y-4">
      <TemperatureTrends avgTemp={avgTemp} />
      <PrecipitationTrends avgPrecipProb={avgPrecipProb} />
      <RecentEvents alerts={recentAlerts} />
    </div>
  );
}; 