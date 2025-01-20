import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronDown, ChevronUp, Trash2, Pen, Check } from 'lucide-react';
import { projectSitesService } from '@/services/projectSites';
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
  onSiteDelete: (siteId: string) => void;
}

export function ProjectSitesList({ sites: initialSites, onSiteClick, isLoading, onSiteDelete }: ProjectSitesListProps) {
  const [sites, setSites] = useState(initialSites);
  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<ProjectSite | null>(null);
  const [isListVisible, setIsListVisible] = useState(true);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

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
      setSites(sites.map(s => s.id === site.id ? { ...s, ...typedUpdatedSite } : s));
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-lg font-semibold text-white border-b border-white/20 pb-2 cursor-pointer hover:text-white/80" onClick={() => setIsListVisible(!isListVisible)}>
          <span>Project Sites</span>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isListVisible ? 'rotate-180' : ''}`} />
        </div>
        <div className="text-white/60">Loading sites...</div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-lg font-semibold text-white border-b border-white/20 pb-2 cursor-pointer hover:text-white/80" onClick={() => setIsListVisible(!isListVisible)}>
          <span>Project Sites</span>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isListVisible ? 'rotate-180' : ''}`} />
        </div>
        <div className="text-white/60">No project sites created yet.</div>
      </div>
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
    <>
      <div className="space-y-4">
        <div className={`flex items-center justify-between text-lg font-semibold text-white pb-2 cursor-pointer hover:text-white/80 ${isListVisible ? 'border-b border-white/20' : ''}`} onClick={() => setIsListVisible(!isListVisible)}>
          <span>My Project Sites</span>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isListVisible ? 'rotate-180' : ''}`} />
        </div>
        {isListVisible && (
          <div className="space-y-2">
            {sites.map((site) => (
              <div key={site.id} className="rounded-lg overflow-hidden mr-2">
                <div
                  className="w-full flex justify-between items-center text-white h-auto p-2 hover:bg-white/10 rounded-md cursor-pointer"
                  onClick={() => onSiteClick(site)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <MapPin className="h-4 w-4" />
                    {editingSiteId === site.id ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white text-stone-900 border-none mr-2 p-2 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="font-medium">{site.name}</span>
                    )}
                  </div>
                  <div className="flex items-center">
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
            ))}
          </div>
        )}
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
    </>
  );
} 