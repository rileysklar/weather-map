import React, { useState, useEffect } from 'react';
import { ChevronRight, AlertTriangle, History, BarChart3, Cloud, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
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
}: SidebarProps) {
  const [activeWeatherAlerts, setActiveWeatherAlerts] = useState<number>(2); // Placeholder count
  const [isAlertsVisible, setIsAlertsVisible] = useState(false);
  const [isRiskVisible, setIsRiskVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isProjectsVisible, setIsProjectsVisible] = useState(false);

  // Keep sidebar open when in project mode
  useEffect(() => {
    if (isProjectMode) {
      onOpenChange(true);
    }
  }, [isProjectMode, onOpenChange]);

  return (
    <Sheet 
      open={isOpen} 
      onOpenChange={(open) => {
        // Only allow closing if not in project mode
        if (!isProjectMode) {
          onOpenChange(open);
        }
      }}
      modal={!isProjectMode}
    >
      <SheetTrigger asChild>
        <button 
          className={`fixed left-4 top-4 z-50 bg-[#4285F4] backdrop-blur-md border border-white/20 text-white hover:bg-[#3367D6] px-4 py-2 rounded-lg font-black-ops-one text-xl transition-all duration-500 hover:scale-105 flex items-center gap-2 group ${
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
          <div className={`h-full bg-background/80 backdrop-blur-md ${isProjectMode ? 'pointer-events-auto' : ''}`}>
            <SheetHeader className="p-4 border-b border-white/20">
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
            <div className="flex flex-col gap-6 p-6">
              {!isProjectMode && (
                <>
                  <div className="space-y-4">
                    {/* <h3 className="text-lg font-semibold text-white">Search Location</h3> */}
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
                    <div 
                      className={`flex items-center justify-between text-lg font-semibold text-white pb-2 cursor-pointer hover:text-white/80 ${isProjectsVisible ? 'border-b border-white/20' : ''}`}
                      onClick={() => setIsProjectsVisible(!isProjectsVisible)}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-emerald-400" />
                        <span>My Project Sites</span>
                        <span className="px-2 py-0.5 text-sm bg-emerald-500/20 text-emerald-400 rounded-full">
                          {projectSites.length}
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isProjectsVisible ? 'rotate-180' : ''}`} />
                    </div>
                    {isProjectsVisible && (
                      <ProjectSitesList
                        sites={projectSites}
                        onSiteClick={onProjectSiteClick}
                        isLoading={isLoadingSites}
                        onSiteDelete={onProjectSiteDelete}
                      />
                    )}
                  </div>

                  {/* Weather Alerts Section */}
                  <div className="space-y-4">
                    <div 
                      className={`flex items-center justify-between text-lg font-semibold text-white pb-2 cursor-pointer hover:text-white/80 ${isAlertsVisible ? 'border-b border-white/20' : ''}`}
                      onClick={() => setIsAlertsVisible(!isAlertsVisible)}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span>Active Alerts</span>
                        {activeWeatherAlerts > 0 && (
                          <span className="px-2 py-0.5 text-sm bg-yellow-500/20 text-yellow-500 rounded-full">
                            {activeWeatherAlerts}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isAlertsVisible ? 'rotate-180' : ''}`} />
                    </div>
                    {isAlertsVisible && (
                      <div className="space-y-2 text-white/80">
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <p className="font-medium text-yellow-500">Severe Thunderstorm Warning</p>
                          <p className="text-sm mt-1">Active for 2 project sites in Austin area</p>
                        </div>
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="font-medium text-red-500">Flash Flood Watch</p>
                          <p className="text-sm mt-1">Active for 1 project site in Houston area</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risk Assessment Section */}
                  <div className="space-y-4">
                    <div 
                      className={`flex items-center justify-between text-lg font-semibold text-white pb-2 cursor-pointer hover:text-white/80 ${isRiskVisible ? 'border-b border-white/20' : ''}`}
                      onClick={() => setIsRiskVisible(!isRiskVisible)}
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-400" />
                        <span>Risk Assessment</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isRiskVisible ? 'rotate-180' : ''}`} />
                    </div>
                    {isRiskVisible && (
                      <div className="space-y-2 text-white/80">
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">Flood Risk Index</p>
                            <span className="text-yellow-500">Moderate</span>
                          </div>
                          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-[60%] bg-yellow-500 rounded-full" />
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">Wind Damage Risk</p>
                            <span className="text-green-500">Low</span>
                          </div>
                          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-[30%] bg-green-500 rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Historical Weather Section */}
                  <div className="space-y-4">
                    <div 
                      className={`flex items-center justify-between text-lg font-semibold text-white pb-2 cursor-pointer hover:text-white/80 ${isHistoryVisible ? 'border-b border-white/20' : ''}`}
                      onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                    >
                      <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-purple-400" />
                        <span>Historical Data</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isHistoryVisible ? 'rotate-180' : ''}`} />
                    </div>
                    {isHistoryVisible && (
                      <div className="space-y-2 text-white/80">
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <p className="font-medium flex items-center gap-2">
                            <Cloud className="h-4 w-4" />
                            Precipitation Trends
                          </p>
                          <p className="text-sm mt-1">30% above average for May</p>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <p className="font-medium">Recent Events</p>
                          <div className="mt-2 text-sm space-y-1">
                            <p>• Heavy rainfall event (Apr 15)</p>
                            <p>• High wind advisory (Apr 2)</p>
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
                />
              ) : null}

              <div className="mt-auto pt-6 border-t border-white/20">
                <button
                  onClick={onProjectModeToggle}
                  className={`w-full bg-[#4285F4] hover:bg-[#3367D6] backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200`}
                >
                  {isProjectMode ? 'Cancel Project Site' : 'New Project Site'}
                </button>
              </div>
            </div>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
} 