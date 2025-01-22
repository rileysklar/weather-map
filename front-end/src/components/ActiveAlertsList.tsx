import React from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { WeatherAlert } from '@/services/weather';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
}

export function ActiveAlertsList({ alerts, alertPreferences, expandedAlertId, onExpandAlert }: ActiveAlertsListProps) {
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
    <div className="space-y-2 text-white/80">
      {filteredAlerts.map((alert, index) => {
        const alertId = `${alert.site}-${alert.phenomenon}-${alert.type}-${index}`;
        const siteNames = alert.site.split(', ');
        
        return (
          <div
            key={alertId}
            className="rounded-lg overflow-hidden"
          >
            <div 
              className={`w-full p-4 rounded-md cursor-pointer ${
                alert.type === 'Warning' ? 'bg-red-500/20' :
                alert.type === 'Watch' ? 'bg-orange-500/20' :
                alert.type === 'Advisory' ? 'bg-yellow-500/20' :
                'bg-blue-500/20'
              }`}
              onClick={() => onExpandAlert(expandedAlertId === alertId ? null : alertId)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-white font-medium">{alert.description}</div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-md ${
                      alert.type === 'Warning' ? 'bg-red-500/40 text-red-200' :
                      alert.type === 'Watch' ? 'bg-orange-500/40 text-orange-200' :
                      alert.type === 'Advisory' ? 'bg-yellow-500/40 text-yellow-200' :
                      'bg-blue-500/40 text-blue-200'
                    }`}>
                      {alert.type}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 text-white/80 transition-transform duration-200 ${
                        expandedAlertId === alertId ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {siteNames.map((site, i) => (
                    <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-sm text-white/80">
                      {site.trim()}
                    </span>
                  ))}
                </div>
              </div>
              {expandedAlertId === alertId && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-sm">
                  {alert.event && (
                    <div>
                      <span className="text-white/60">Event:</span>
                      <span className="text-white ml-2">{alert.event}</span>
                    </div>
                  )}
                  {alert.severity && (
                    <div>
                      <span className="text-white/60">Severity:</span>
                      <span className="text-white ml-2">{alert.severity}</span>
                    </div>
                  )}
                  {alert.certainty && (
                    <div>
                      <span className="text-white/60">Certainty:</span>
                      <span className="text-white ml-2">{alert.certainty}</span>
                    </div>
                  )}
                  {alert.urgency && (
                    <div>
                      <span className="text-white/60">Urgency:</span>
                      <span className="text-white ml-2">{alert.urgency}</span>
                    </div>
                  )}
                  {alert.onset && (
                    <div>
                      <span className="text-white/60">Onset:</span>
                      <span className="text-white ml-2">
                        {new Date(alert.onset).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {alert.instruction && (
                    <div>
                      <span className="text-white/60 block mb-1">Instructions:</span>
                      <p className="text-white/90 whitespace-pre-wrap">{alert.instruction}</p>
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