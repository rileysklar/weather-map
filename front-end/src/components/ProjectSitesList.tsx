import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface ProjectSite {
  id: string;
  name: string;
  description: string;
  polygon: {
    type: string;
    coordinates: number[][][];
  };
  created_at: string;
}

interface ProjectSitesListProps {
  sites: ProjectSite[];
  onSiteClick: (site: ProjectSite) => void;
  isLoading: boolean;
}

export function ProjectSitesList({ sites, onSiteClick, isLoading }: ProjectSitesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Project Sites</h3>
        <div className="text-white/60">Loading sites...</div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Project Sites</h3>
        <div className="text-white/60">No project sites created yet.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Project Sites</h3>
      <div className="space-y-2">
        {sites.map((site) => (
          <Button
            key={site.id}
            variant="ghost"
            className="w-full justify-start gap-2 text-white hover:bg-white/10"
            onClick={() => onSiteClick(site)}
          >
            <MapPin className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="font-medium">{site.name}</span>
              {site.description && (
                <span className="text-sm text-white/60 line-clamp-1">{site.description}</span>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
} 