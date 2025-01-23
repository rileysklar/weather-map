import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronDown, ChevronUp, Trash2, Pen, Check, AlertTriangle } from 'lucide-react';
import { projectSitesService } from '@/services/projectSites';
import { weatherService, WeatherAlert } from '@/services/weather';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectSite {
  id: string;
  name: string;
  description: string;
  polygon: {
    type: string;
    coordinates: number[][][];
  };
  created_at: string;
  alerts?: WeatherAlert[];
}

interface ProjectSitesListProps {
  sites: ProjectSite[];
  onSiteClick: (site: ProjectSite) => void;
  isLoading: boolean;
  onSiteDelete: (siteId: string) => void;
  onWeatherAlerts: (alerts: WeatherAlert[], siteName: string) => void;
  setProjectSites: React.Dispatch<React.SetStateAction<ProjectSite[]>>;
}

export function ProjectSitesList({ 
  sites: initialSites, 
  onSiteClick, 
  isLoading, 
  onSiteDelete, 
  onWeatherAlerts,
  setProjectSites 
}: ProjectSitesListProps) {
  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [sites, setSites] = useState<ProjectSite[]>(initialSites);
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<ProjectSite | null>(null);
  const [isListVisible, setIsListVisible] = useState(true);

  // Update sites when initialSites changes
  useEffect(() => {
    setSites(initialSites);
  }, [initialSites]);

  const handleEditClick = (site: ProjectSite, event: React.MouseEvent) => {
    event.stopPropagation();
    if (editingSiteId === site.id) {
      setEditingSiteId(null);
      setEditForm({ name: '', description: '' });
    } else {
      setExpandedSiteId(site.id);
      setEditingSiteId(site.id);
      setEditForm({ name: site.name, description: site.description || '' });
    }
  };

  const handleEditSubmit = async (site: ProjectSite) => {
    try {
      const updatedSite = await projectSitesService.update(site.id, {
        name: editForm.name,
        description: editForm.description,
      });
      const typedUpdatedSite = updatedSite as ProjectSite;
      
      // Update local state
      setSites(prevSites => 
        prevSites.map(s => s.id === site.id ? { ...s, ...typedUpdatedSite } : s)
      );
      
      // Update parent state
      setProjectSites(prevSites => 
        prevSites.map(s => s.id === site.id ? { ...s, ...typedUpdatedSite } : s)
      );
      
      // Reset edit state
      setEditingSiteId(null);
      setEditForm({ name: '', description: '' });
    } catch (error) {
      console.error('Error updating site:', error);
    }
  };

  const handleDeleteClick = (site: ProjectSite, event: React.MouseEvent) => {
    event.stopPropagation();
    if (deletingSiteId) return;
    setSiteToDelete(site);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!siteToDelete) return;
    
    try {
      setDeletingSiteId(siteToDelete.id);
      await projectSitesService.delete(siteToDelete.id);
      setSites(sites.filter(site => site.id !== siteToDelete.id));
      onSiteDelete(siteToDelete.id);
    } catch (error) {
      console.error('Error deleting site:', error);
    } finally {
      setDeletingSiteId(null);
      setSiteToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const toggleExpand = (siteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedSiteId(expandedSiteId === siteId ? null : siteId);
  };

  const handleSiteClick = async (site: ProjectSite) => {
    try {
      // Get the first coordinate pair from the polygon (assuming it's the center/main point)
      const [longitude, latitude] = site.polygon.coordinates[0][0];
      
      console.log('🎯 Fetching weather data for:', site.name);
      console.log('📍 Coordinates:', { latitude, longitude });
      
      const weatherData = await weatherService.getWeatherData(latitude, longitude, site.name, site.id);
      
      console.log('🌤️ Weather Data:', {
        alerts: weatherData.alerts,
        alertCount: weatherData.alerts?.length || 0
      });

      // Update the site's alerts in the local state
      setSites(prevSites => {
        const updatedSites = prevSites.map(s => 
          s.id === site.id 
            ? { ...s, alerts: weatherData.alerts }
            : s
        );
        console.log('🔄 Updated sites:', updatedSites.map(s => ({
          id: s.id,
          name: s.name,
          alertCount: s.alerts?.length || 0,
          alertTypes: s.alerts?.map(a => a.type)
        })));
        return updatedSites;
      });

      // Pass alerts to the sidebar
      onWeatherAlerts(weatherData.alerts, site.name);
      
      // Still call the original onSiteClick handler
      onSiteClick(site);
    } catch (error) {
      console.error('❌ Error fetching weather data:', error);
      // Still call the original onSiteClick handler even if weather fetch fails
      onSiteClick(site);
    }
  };

  // Add debug log for initial render
  useEffect(() => {
    console.log('🏁 Initial sites state:', sites.map(s => ({
      id: s.id,
      name: s.name,
      alertCount: s.alerts?.length || 0,
      alertTypes: s.alerts?.map(a => a.type)
    })));
  }, [sites]);

  if (isLoading) {
    return (
      <div className="text-white/60">Loading sites...</div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="text-white/60">No project sites created yet.</div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {sites.map((site) => {
          console.log('🎨 Rendering site:', {
            id: site.id,
            name: site.name,
            alertCount: site.alerts?.length || 0,
            alertTypes: site.alerts?.map(a => a.type)
          });
          return (
            <div key={site.id} className="rounded-lg overflow-hidden">
              <div
                className="w-full flex justify-between bg-white/5 items-center text-white h-auto p-4 hover:bg-white/15 rounded-md cursor-pointer"
                onClick={() => handleSiteClick(site)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  
                  {editingSiteId === site.id ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white text-stone-900 border-none mr-2 p-2 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium line-clamp-2 text-ellipsis">{site.name}</span>
                      {site.alerts && site.alerts.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {site.alerts?.some(alert => alert.type === 'Warning') && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/20">
                                  <AlertTriangle className="h-3 w-3 text-red-400" />
                                  <span className="text-xs text-red-400">Warning</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{site.alerts.find(a => a.type === 'Warning')?.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {site.alerts?.some(alert => alert.type === 'Watch') && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-orange-500/20">
                                  <AlertTriangle className="h-3 w-3 text-orange-400" />
                                  <span className="text-xs text-orange-400">Watch</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{site.alerts.find(a => a.type === 'Watch')?.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {site.alerts?.some(alert => alert.type === 'Advisory') && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/20">
                                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                                  <span className="text-xs text-yellow-400">Advisory</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{site.alerts.find(a => a.type === 'Advisory')?.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {site.alerts?.some(alert => alert.type === 'Statement') && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/20">
                                  <AlertTriangle className="h-3 w-3 text-blue-400" />
                                  <span className="text-xs text-blue-400">Statement</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{site.alerts.find(a => a.type === 'Statement')?.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 p-1 ${
                          editingSiteId === site.id 
                            ? 'text-green-400 hover:bg-green-500/20 hover:text-green-300'
                            : 'text-blue-400 hover:bg-blue-500/20 hover:text-blue-300'
                        }`}
                        onClick={(e) => editingSiteId === site.id ? handleEditSubmit(site) : handleEditClick(site, e)}
                      >
                        {editingSiteId === site.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Pen className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{editingSiteId === site.id ? 'Save Changes' : 'Edit Site'}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-1 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        onClick={(e) => handleDeleteClick(site, e)}
                        disabled={deletingSiteId === site.id}
                      >
                        {deletingSiteId === site.id ? (
                          <div className="h-4 w-4 border-2 border-t-transparent border-red-400 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Site</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-1 text-white hover:bg-white/20"
                        onClick={(e) => toggleExpand(site.id, e)}
                      >
                        {expandedSiteId === site.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{expandedSiteId === site.id ? 'Show Less' : 'Show More'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              {expandedSiteId === site.id && (
                <div className="px-4 py-3 bg-white/5 border-t border-white/10">
                  <div className="space-y-2 text-sm text-white/80">
                    <p className="text-white/90">Description:</p>
                    {editingSiteId === site.id ? (
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-white text-stone-900 border-none p-2 resize-none min-h-[60px] focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Add a description..."
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className="pl-2 text-white/90">{site.description || 'No description provided'}</p>
                    )}
                    <p className="text-white/90 mt-2">Created:</p>
                    <p className="pl-2">{formatDate(site.created_at)}</p>
                    <p className="text-white/90 mt-2">Coordinates:</p>
                    <p className="pl-2 font-mono text-xs">
                      Center: {site.polygon.coordinates[0][0][0].toFixed(4)}, {site.polygon.coordinates[0][0][1].toFixed(4)}
                    </p>
                    {editingSiteId === site.id && (
                      <div className="flex gap-2 justify-end pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSiteId(null);
                            setEditForm({ name: '', description: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black/90 border border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project Site</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete "{siteToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              onClick={() => setSiteToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500/50 text-white hover:bg-red-500/70"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
} 