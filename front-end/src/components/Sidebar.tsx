import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetOverlay,
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
        <Button
          variant="outline"
          size="icon"
          className="fixed left-4 top-4 z-50 bg-black/25 backdrop-blur-md border-white/20 text-white hover:bg-black/40"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetPortal>
        <SheetContent side="left" className="w-[400px] sm:w-[540px] p-0">
          <SheetHeader className="p-6 border-b border-white/20">
            <SheetTitle className="text-white font-black-ops-one">🛡️MapShield</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-6 p-6">
            {!isProjectMode && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Search Location</h3>
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
              <Button
                onClick={onProjectModeToggle}
                className={`w-full ${
                  isProjectMode
                    ? 'bg-blue-500/50 hover:bg-blue-500/60'
                    : 'bg-black/25 hover:bg-black/40'
                } backdrop-blur-md border border-white/20 text-white`}
              >
                {isProjectMode ? 'Cancel Project Site' : 'Create Project Site'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
} 