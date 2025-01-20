import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
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
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Keep sidebar open when in project mode
  useEffect(() => {
    if (isProjectMode) {
      setIsOpen(true);
    }
  }, [isProjectMode]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button 
          className={`fixed left-4 top-4 z-50 bg-[#4285F4] backdrop-blur-md border border-white/20 text-white hover:bg-[#3367D6] px-4 py-2 rounded-lg font-black-ops-one text-xl transition-all duration-500 hover:scale-105 flex items-center gap-2 group ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        >
          🛡️MapShield
          <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </SheetTrigger>
      <SheetPortal>
        <SheetContent side="left" className="w-[400px] sm:w-[540px] p-0 [&>button]:hidden">
          <SheetHeader className="p-6 border-b border-white/20">
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
                className="text-white font-black-ops-one text-xl flex items-center gap-2 cursor-pointer hover:opacity-80"
                onClick={() => setIsOpen(false)}
              >
                🛡️MapShield
                <ChevronRight className="w-5 h-5 -rotate-90" />
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
                <ProjectSitesList
                  sites={projectSites}
                  onSiteClick={onProjectSiteClick}
                  isLoading={isLoadingSites}
                />
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
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
} 