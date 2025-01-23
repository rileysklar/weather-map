import React from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { WeatherAlert } from '@/services/weather';

interface ActiveAlertsListProps {
  alerts: WeatherAlert[];
  alertPreferences: {
    warnings: boolean;
    watches: boolean;
    advisories: boolean;
    statements: boolean;
  };
  expandedAlertId: string | null;
  onExpandAlert: (alertId: string | null) => void;
  onNavigateToSite?: (siteId: string) => void;
  projectWeather?: Array<{
    id: string;
    project_site_id: string;
    site_name: string;
    weather_data: {
      alerts?: WeatherAlert[];
    };
  }>;
}

export function ActiveAlertsList({ alerts, alertPreferences, expandedAlertId, onExpandAlert, onNavigateToSite, projectWeather }: ActiveAlertsListProps) {
  // Translate NOAA codes to human-readable text
  const translateNoaaCodes = (description: string) => {
    return description
      .replace(/\bAQ\b/g, 'Air Quality')
      .replace(/\bTemp\b/g, 'Temperature');
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (alert.type) {
      case 'Warning':
        return alertPreferences.warnings;
      case 'Watch':
        return alertPreferences.watches;
      case 'Advisory':
        return alertPreferences.advisories;
      case 'Statement':
        return alertPreferences.statements;
      default:
        return true;
    }
  });

  if (filteredAlerts.length === 0) {
    return (
      <div className="text-white/60 text-sm">
        {alerts.length === 0 ? 'No active weather alerts.' : 'No alerts match your preferences.'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredAlerts.map((alert, index) => {
        const expandedDescription = translateNoaaCodes(alert.description);
        const siteNames = alert.site.split(', ');
        const siteWeather = projectWeather?.find(pw => siteNames.includes(pw.site_name));
        const isExpanded = expandedAlertId === `${alert.description}-${index}`;
        
        return (
          <div 
            key={index}
            className={`rounded-lg overflow-hidden bg-blur-md ${
              alert.type === 'Warning' ? 'bg-red-500/20' :
              alert.type === 'Watch' ? 'bg-orange-500/20' :
              alert.type === 'Advisory' ? 'bg-yellow-500/20' :
              'bg-blue-950/20'
            }`}
          >
            {/* Header with alert description and type */}
            <div className="p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-white text-lg font-medium">{expandedDescription}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  alert.type === 'Warning' ? 'bg-red-500/20 text-red-400' :
                  alert.type === 'Watch' ? 'bg-orange-500/20 text-orange-400' :
                  alert.type === 'Advisory' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {alert.type}
                </span>
              </div>
              <button
                className="text-white/90 bg-white/10 px-2 py-1 rounded-md hover:text-white text-sm font-medium underline-offset-2 hover:underline"
                onClick={() => {
                  if (siteWeather) {
                    onNavigateToSite?.(siteWeather.project_site_id);
                  }
                }}
              >
                {siteNames[0]}
              </button>
            </div>

            {/* Alert details */}
            <div 
              className="px-4 pb-4 cursor-pointer"
              onClick={() => onExpandAlert(isExpanded ? null : `${alert.description}-${index}`)}
            >
              <div className="flex items-center justify-between text-sm text-white/90">
                <span>Details</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>
              
              {isExpanded && (
                <div className="mt-2 space-y-1 text-sm text-white/80">
                  <div>Severity: {alert.severity || 'Not specified'}</div>
                  <div>Certainty: {alert.certainty || 'Not specified'}</div>
                  <div>Urgency: {alert.urgency || 'Not specified'}</div>
                  {alert.onset && (
                    <div>Onset: {new Date(alert.onset).toLocaleString()}</div>
                  )}
                  {alert.instruction && (
                    <div className="mt-2 text-white/70">
                      <div>Instructions:</div>
                      <div className="text-xs mt-1">{alert.instruction}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 