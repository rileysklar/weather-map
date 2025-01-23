import React, { useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

interface ProjectWeather {
  id: number;
  project_site_id: string;
  weather_data: {
    point: {
      '@id': string;
    };
    forecast: Array<{
      temperature: number;
      probabilityOfPrecipitation: {
        value: number | null;
      };
    }>;
    alerts: Array<{
      type: string;
      description: string;
      site: string;
    }>;
  };
  created_at: string;
  updated_at: string;
  next_update: string;
}

interface RiskAssessmentProps {
  projectWeather: ProjectWeather[];
}

export function RiskAssessment({ projectWeather }: RiskAssessmentProps) {
  useEffect(() => {
    // Log project weather data
    console.log('Project Weather Data:', {
      totalSites: projectWeather.length,
      weatherData: projectWeather.map(pw => ({
        siteId: pw.project_site_id,
        forecast: pw.weather_data.forecast,
        alerts: pw.weather_data.alerts,
        lastUpdate: pw.updated_at,
        nextUpdate: pw.next_update
      }))
    });
  }, [projectWeather]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-white">
        <BarChart3 className="h-5 w-5 text-blue-400" />
        <span>Weather Risk Assessment</span>
      </div>

      {projectWeather.map((pw) => (
        <div key={pw.id} className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/60">Site ID</span>
            <span>{pw.project_site_id}</span>
          </div>
          
          {/* Temperature Stats */}
          {pw.weather_data.forecast && pw.weather_data.forecast.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Average Temperature</span>
                <span>
                  {(pw.weather_data.forecast.reduce((acc, f) => acc + f.temperature, 0) / 
                  pw.weather_data.forecast.length).toFixed(1)}°F
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, Math.max(0, 
                      (pw.weather_data.forecast.reduce((acc, f) => acc + f.temperature, 0) / 
                      pw.weather_data.forecast.length) / 100 * 100
                    ))}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Precipitation Stats */}
          {pw.weather_data.forecast && pw.weather_data.forecast.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Precipitation Probability</span>
                <span>
                  {(pw.weather_data.forecast.reduce((acc, f) => acc + (f.probabilityOfPrecipitation.value || 0), 0) / 
                  pw.weather_data.forecast.length).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, Math.max(0, 
                      pw.weather_data.forecast.reduce((acc, f) => acc + (f.probabilityOfPrecipitation.value || 0), 0) / 
                      pw.weather_data.forecast.length
                    ))}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Active Alerts */}
          {pw.weather_data.alerts && pw.weather_data.alerts.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-white/60">Active Alerts</span>
              <div className="space-y-1">
                {pw.weather_data.alerts.map((alert, index) => (
                  <div 
                    key={index}
                    className={`text-xs px-2 py-1 rounded ${
                      alert.type === 'Warning' ? 'bg-red-500/20 text-red-400' :
                      alert.type === 'Watch' ? 'bg-orange-500/20 text-orange-400' :
                      alert.type === 'Advisory' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {alert.description}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update Info */}
          <div className="text-xs text-white/40 pt-2 border-t border-white/10">
            Last updated: {new Date(pw.updated_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
} 