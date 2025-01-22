"use client"

import React, { useState, useEffect } from 'react';
import { ChevronRight, AlertTriangle, History, BarChart3, Cloud, ChevronDown, ChevronUp, Building2, Download, Upload, RefreshCw, Settings } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetPortal,
} from '@/components/ui/sheet';
import { SearchBar } from './SearchBar';
import ProjectSiteForm from './ProjectSiteForm';
import { ProjectSitesList } from './ProjectSitesList';
import { WeatherAlert } from '@/services/weather';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { projectExportService } from '@/services/projectExport';
import { projectImportService } from '@/services/projectImport';
import { weatherService } from '@/services/weather';
import { SettingsPanel } from './SettingsPanel';
import { ActiveAlertsList } from './ActiveAlertsList';

interface SidebarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
  isLoading?: boolean;
  error?: string | null;
  isProjectMode: boolean;
  isDrawing: boolean;
  currentPolygon: Array<{ id: string; coordinates: number[]; index: number }>;
  onProjectModeToggle: () => void;
  onProjectSiteSubmit: (data: { name: string; description: string; polygon: number[][] }) => void;
  onProjectCancel: () => void;
  projectSites: any[];
  isLoadingSites: boolean;
  onProjectSiteClick: (site: any) => void;
  onProjectSiteDelete: (siteId: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  setProjectSites: React.Dispatch<React.SetStateAction<any[]>>;
}

export function Sidebar({
  searchValue,
  onSearchChange,
  onSearch,
  isLoading,
  error,
  isProjectMode,
  isDrawing,
  currentPolygon,
  onProjectModeToggle,
  onProjectSiteSubmit,
  onProjectCancel,
  projectSites,
  isLoadingSites,
  onProjectSiteClick,
  onProjectSiteDelete,
  isOpen,
  onOpenChange,
  setProjectSites,
}: SidebarProps) {
  const [activeWeatherAlerts, setActiveWeatherAlerts] = useState<number>(2); // Placeholder count
  const [isAlertsVisible, setIsAlertsVisible] = useState(false);
  const [isRiskVisible, setIsRiskVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isProjectsVisible, setIsProjectsVisible] = useState(false);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [alertPreferences, setAlertPreferences] = useState({
    warnings: true,
    watches: true,
    advisories: true,
    statements: true
  });
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  // Update alerts when project sites change
  useEffect(() => {
    // Collect all alerts from all project sites
    const allAlerts = projectSites.reduce<WeatherAlert[]>((acc, site) => {
      if (site.alerts) {
        // Create a map of existing alerts using description and type as the key
        const existingAlerts = new Map(
          acc.map((alert: WeatherAlert) => [
            `${alert.description}-${alert.type}`,
            alert
          ])
        );

        // Add new alerts, replacing existing ones if they have the same description and type
        site.alerts.forEach((alert: WeatherAlert) => {
          const key = `${alert.description}-${alert.type}`;
          // Only update if the alert doesn't exist or if it's from a different site
          if (!existingAlerts.has(key)) {
            existingAlerts.set(key, alert);
          } else {
            // If we already have this alert type, append the site name if it's different
            const existingAlert = existingAlerts.get(key)!;
            if (!existingAlert.site.includes(site.name)) {
              existingAlerts.set(key, {
                ...existingAlert,
                site: `${existingAlert.site}, ${site.name}`
              });
            }
          }
        });

        // Convert back to array
        return Array.from(existingAlerts.values());
      }
      return acc;
    }, []);

    // Sort by type severity
    const severityOrder = { Warning: 0, Watch: 1, Advisory: 2, Statement: 3 };
    const sortedAlerts = allAlerts.sort((a, b) => 
      severityOrder[a.type] - severityOrder[b.type]
    );

    setAlerts(sortedAlerts);
  }, [projectSites]);

  // Keep sidebar open when in project mode
  useEffect(() => {
    if (isProjectMode) {
      onOpenChange(true);
    }
  }, [isProjectMode, onOpenChange]);

  const handleWeatherAlerts = (newAlerts: WeatherAlert[], siteName: string) => {
    // Update alerts
    setAlerts(prevAlerts => {
      // Create a map of existing alerts using description and type as the key
      const existingAlerts = new Map(
        prevAlerts.map(alert => [
          `${alert.description}-${alert.type}`,
          alert
        ])
      );

      // Add new alerts, replacing existing ones if they have the same description and type
      newAlerts.forEach(alert => {
        const key = `${alert.description}-${alert.type}`;
        // Only update if the alert doesn't exist or if it's from a different site
        if (!existingAlerts.has(key)) {
          existingAlerts.set(key, alert);
        } else {
          // If we already have this alert type, append the site name if it's different
          const existingAlert = existingAlerts.get(key)!;
          if (!existingAlert.site.includes(alert.site)) {
            existingAlerts.set(key, {
              ...existingAlert,
              site: `${existingAlert.site}, ${alert.site}`
            });
          }
        }
      });

      // Convert back to array and sort by type severity
      const severityOrder = { Warning: 0, Watch: 1, Advisory: 2, Statement: 3 };
      return Array.from(existingAlerts.values()).sort((a, b) => 
        severityOrder[a.type] - severityOrder[b.type]
      );
    });

    // Update project sites with their alerts
    setProjectSites(prevSites => 
      prevSites.map(site => 
        site.name === siteName
          ? { ...site, alerts: newAlerts }
          : site
      )
    );
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

  return (
    <TooltipProvider>
      {/* Add floating button for mobile when polygon is drawn but sidebar is closed */}
      {isProjectMode && currentPolygon.length > 0 && !isOpen && (
        <button
          onClick={() => onOpenChange(true)}
          className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 hover:bg-emerald-500/60 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-lg"
        >
          Continue to Form
        </button>
      )}
      <Sheet 
        open={isOpen} 
        onOpenChange={(open) => {
          // Allow opening if we have a polygon drawn
          if (isProjectMode && !open && currentPolygon.length === 0) {
            // Only prevent closing when in project mode with no polygon
            return;
          }
          onOpenChange(open);
        }}
        modal={!isProjectMode}
      >
        <SheetTrigger asChild>
          <button 
            className={`fixed left-4 top-4 z-50 bg-emerald-500 backdrop-blur-md border border-white/20 text-white hover:bg-emerald-600 px-4 py-2 rounded-lg font-black-ops-one text-xl transition-all duration-500 hover:scale-105 flex items-center gap-2 group ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          >
            🛡️MapShield
            <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-90" />
          </button>
        </SheetTrigger>
        <SheetPortal>
          <SheetContent 
            side="left" 
            className="w-full sm:w-[540px] p-0 [&>button]:hidden"
            onPointerDownOutside={(e) => {
              if (isProjectMode) {
                e.preventDefault();
              }
            }}
          >
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
              }
              .custom-scrollbar {
                scrollbar-gutter: stable;
              }
            `}</style>
            <div className={`h-full bg-background/80 backdrop-blur-md flex flex-col ${isProjectMode ? 'pointer-events-auto' : ''}`}>
              <SheetHeader className="p-4 border-b border-white/20 flex-none">
                <div 
                  className={`transition-all duration-500 ${
                    isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                  }`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    width: '100%',
                    justifyContent: 'space-between'
                  }}
                >
                  <SheetTitle 
                    className="text-white font-black-ops-one p-2 rounded-lg hover:bg-white/10 text-xl flex items-center justify-end gap-2 cursor-pointer hover:opacity-80 group"
                    onClick={() => onOpenChange(false)}
                  >
                    🛡️MapShield
                    <ChevronRight className="w-5 h-5 -rotate-90 group-hover:rotate-90 transition-transform duration-300" />
                  </SheetTitle>
                </div>
              </SheetHeader>
              <div className="flex-1 min-h-0 flex flex-col relative">
                <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${isSettingsOpen ? 'opacity-0 -translate-x-full absolute' : 'opacity-100 translate-x-0 relative'}`}>
                  <div className="p-6 flex flex-col gap-6">
                    {!isProjectMode && (
                      <>
                        <div className="space-y-4">
                          <SearchBar
                            value={searchValue}
                            onChange={onSearchChange}
                            onSearch={onSearch}
                            isLoading={isLoading}
                            error={error}
                          />
                        </div>

                        {/* Project Sites Section */}
                        <div className="space-y-4">
                          <button 
                            className={`w-full flex items-center justify-between text-lg font-semibold text-white pb-2 cursor-pointer hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20  ${isProjectsVisible ? 'border-b border-white/20' : ''}`}
                            onClick={() => setIsProjectsVisible(!isProjectsVisible)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsProjectsVisible(!isProjectsVisible);
                              }
                            }}
                            aria-expanded={isProjectsVisible}
                            aria-controls="project-sites-content"
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                              <span>My Project Sites</span>
                              <div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="w-6 h-6 flex items-center justify-center text-sm bg-emerald-500/20 text-emerald-400 rounded-full">
                                      {projectSites.length}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Total Project Sites</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                            <ChevronDown 
                              className={`w-5 h-5 transition-transform duration-200 ${isProjectsVisible ? 'rotate-180' : ''}`} 
                              aria-hidden="true"
                            />
                          </button>
                          {isProjectsVisible && (
                            <div id="project-sites-content">
                              <ProjectSitesList
                                sites={projectSites}
                                onSiteClick={onProjectSiteClick}
                                isLoading={isLoadingSites}
                                onSiteDelete={onProjectSiteDelete}
                                onWeatherAlerts={(newAlerts, siteName) => handleWeatherAlerts(newAlerts, siteName)}
                              />
                            </div>
                          )}
                        </div>

                        {/* Weather Alerts Section */}
                        <div className="space-y-4">
                          <button 
                            className={`w-full flex items-center justify-between text-lg font-semibold text-white pb-2 cursor-pointer hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${isAlertsVisible ? 'border-b border-white/20' : ''}`}
                            onClick={() => setIsAlertsVisible(!isAlertsVisible)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsAlertsVisible(!isAlertsVisible);
                              }
                            }}
                            aria-expanded={isAlertsVisible}
                            aria-controls="alerts-content"
                          >
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                              <span>Active Alerts</span>
                              {alerts.length > 0 && (
                                <div className="flex items-center -space-x-1.5">
                                  {alerts.filter(a => a.type === 'Warning').length > 0 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="w-6 h-6 flex items-center justify-center bg-red-500/20 text-red-400 rounded-full text-sm">
                                          {alerts.filter(a => a.type === 'Warning').length}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Active Warnings</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {alerts.filter(a => a.type === 'Watch').length > 0 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="w-6 h-6 flex items-center justify-center bg-orange-500/20 text-orange-400 rounded-full text-sm">
                                          {alerts.filter(a => a.type === 'Watch').length}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Active Watches</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {alerts.filter(a => a.type === 'Advisory').length > 0 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="w-6 h-6 flex items-center justify-center bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                                          {alerts.filter(a => a.type === 'Advisory').length}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Active Advisories</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {alerts.filter(a => a.type === 'Statement').length > 0 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="w-6 h-6 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full text-sm">
                                          {alerts.filter(a => a.type === 'Statement').length}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Active Statements</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              )}
                            </div>
                            <ChevronDown 
                              className={`w-5 h-5 transition-transform duration-200 ${isAlertsVisible ? 'rotate-180' : ''}`}
                              aria-hidden="true"
                            />
                          </button>
                          {isAlertsVisible && (
                            <div id="alerts-content">
                              <ActiveAlertsList
                                alerts={alerts}
                                alertPreferences={alertPreferences}
                                expandedAlertId={expandedAlertId}
                                onExpandAlert={setExpandedAlertId}
                              />
                            </div>
                          )}
                        </div>

                        {/* Risk Assessment Section */}
                        <div className="space-y-4">
                          <button 
                            className={`w-full flex items-center justify-between text-lg font-semibold text-white pb-2 cursor-pointer hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${isRiskVisible ? 'border-b border-white/20' : ''}`}
                            onClick={() => setIsRiskVisible(!isRiskVisible)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsRiskVisible(!isRiskVisible);
                              }
                            }}
                            aria-expanded={isRiskVisible}
                            aria-controls="risk-assessment-content"
                          >
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-blue-400" aria-hidden="true" />
                              <span>Risk Assessment</span>
                            </div>
                            <ChevronDown 
                              className={`w-5 h-5 transition-transform duration-200 ${isRiskVisible ? 'rotate-180' : ''}`} 
                              aria-hidden="true"
                            />
                          </button>
                          {isRiskVisible && (
                            <div id="risk-assessment-content" className="space-y-2 text-white/80">
                              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <p className="font-medium">Flood Risk Index</p>
                                  <span className="text-yellow-500">Moderate</span>
                                </div>
                                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
                                  <div className="h-full w-[60%] bg-yellow-500 rounded-full" />
                                </div>
                              </div>
                              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <p className="font-medium">Wind Damage Risk</p>
                                  <span className="text-green-500">Low</span>
                                </div>
                                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={30} aria-valuemin={0} aria-valuemax={100}>
                                  <div className="h-full w-[30%] bg-green-500 rounded-full" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Historical Weather Section */}
                        <div className="space-y-4">
                          <button 
                            className={`w-full flex items-center justify-between text-lg font-semibold text-white pb-2 cursor-pointer hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${isHistoryVisible ? 'border-b border-white/20' : ''}`}
                            onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsHistoryVisible(!isHistoryVisible);
                              }
                            }}
                            aria-expanded={isHistoryVisible}
                            aria-controls="historical-data-content"
                          >
                            <div className="flex items-center gap-2">
                              <History className="h-5 w-5 text-purple-400" aria-hidden="true" />
                              <span>Historical Data</span>
                            </div>
                            <ChevronDown 
                              className={`w-5 h-5 transition-transform duration-200 ${isHistoryVisible ? 'rotate-180' : ''}`} 
                              aria-hidden="true"
                            />
                          </button>
                          {isHistoryVisible && (
                            <div id="historical-data-content" className="space-y-2 text-white/80">
                              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                <p className="font-medium flex items-center gap-2">
                                  <Cloud className="h-4 w-4" aria-hidden="true" />
                                  Precipitation Trends
                                </p>
                                <p className="text-sm mt-1">30% above average for May</p>
                              </div>
                              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                <p className="font-medium">Recent Events</p>
                                <div className="mt-2 text-sm space-y-1" role="list">
                                  <p role="listitem">• Heavy rainfall event (Apr 15)</p>
                                  <p role="listitem">• High wind advisory (Apr 2)</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {isProjectMode ? (
                      <ProjectSiteForm
                        isDrawing={isDrawing}
                        currentPolygon={currentPolygon}
                        onSubmit={onProjectSiteSubmit}
                        onCancel={onProjectCancel}
                        onOpenChange={onOpenChange}
                      />
                    ) : null}
                  </div>
                </div>

                <SettingsPanel
                  isOpen={isSettingsOpen}
                  onClose={() => setIsSettingsOpen(false)}
                  alertPreferences={alertPreferences}
                  onAlertPreferencesChange={setAlertPreferences}
                />

                {!isProjectMode && (
                  <div className="flex-none p-6 pt-4 border-t border-white/20 bg-background/80 backdrop-blur-md">
                    <button
                      onClick={onProjectModeToggle}
                      className="w-full bg-emerald-500 hover:bg-emerald-500/60 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                      <Building2 className="w-5 h-5" />
                      Create New Project Site
                    </button>
                    <div className="flex justify-center mt-4 gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setIsSettingsOpen(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsSettingsOpen(true);
                              }
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                          >
                            <Settings className="w-5 h-5 text-white/80" aria-hidden="true" />
                            <span className="sr-only">Open Settings</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Settings</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            role="button"
                            tabIndex={0}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                            onClick={async () => {
                              try {
                                for (const site of projectSites) {
                                  const [longitude, latitude] = site.polygon.coordinates[0][0];
                                  const weatherData = await weatherService.getWeatherData(latitude, longitude, site.name);
                                  handleWeatherAlerts(weatherData.alerts, site.name);
                                }
                              } catch (error) {
                                console.error('Failed to refresh weather alerts:', error);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                (async () => {
                                  try {
                                    for (const site of projectSites) {
                                      const [longitude, latitude] = site.polygon.coordinates[0][0];
                                      const weatherData = await weatherService.getWeatherData(latitude, longitude, site.name);
                                      handleWeatherAlerts(weatherData.alerts, site.name);
                                    }
                                  } catch (error) {
                                    console.error('Failed to refresh weather alerts:', error);
                                  }
                                })();
                              }
                            }}
                          >
                            <RefreshCw className="w-5 h-5 text-white/80" aria-hidden="true" />
                            <span className="sr-only">Refresh Weather Alerts</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Refresh Weather Alerts</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            role="button"
                            tabIndex={0}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.json';
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (!file) return;
                                
                                try {
                                  const result = await projectImportService.handleImport(file);
                                  console.log('Import results:', result);
                                  window.location.reload();
                                } catch (error) {
                                  console.error('Failed to import sites:', error);
                                }
                              };
                              input.click();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.json';
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (!file) return;
                                  
                                  try {
                                    const result = await projectImportService.handleImport(file);
                                    console.log('Import results:', result);
                                    window.location.reload();
                                  } catch (error) {
                                    console.error('Failed to import sites:', error);
                                  }
                                };
                                input.click();
                              }
                            }}
                          >
                            <Upload className="w-5 h-5 text-white/80" aria-hidden="true" />
                            <span className="sr-only">Import Project Sites</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Import Project Sites</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              try {
                                projectExportService.exportToJson(projectSites);
                              } catch (error) {
                                console.error('Failed to export sites:', error);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                try {
                                  projectExportService.exportToJson(projectSites);
                                } catch (error) {
                                  console.error('Failed to export sites:', error);
                                }
                              }
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                          >
                            <Download className="w-5 h-5 text-white/80" aria-hidden="true" />
                            <span className="sr-only">Export Project Sites</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Export Project Sites</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </SheetPortal>
      </Sheet>
    </TooltipProvider>
  );
} 