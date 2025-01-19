import { supabase } from '@/services/supabase';
import { GeometryObject } from 'geojson';

interface ProjectSite {
  id: string;
  name: string;
  description: string;
  polygon: GeometryObject;
  created_at: string;
  updated_at: string;
}

interface CreateProjectSite {
  name: string;
  description: string;
  polygon: GeometryObject;
}

export const projectSitesService = {
  async create(data: CreateProjectSite): Promise<ProjectSite> {
    const { data: projectSite, error } = await supabase
      .from('project_sites')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return projectSite;
  },

  async getAll(): Promise<ProjectSite[]> {
    const { data: projectSites, error } = await supabase
      .from('project_sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return projectSites;
  },

  async getById(id: string): Promise<ProjectSite | null> {
    const { data, error } = await supabase
      .from('project_sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project site:', error);
      throw error;
    }

    return data;
  },

  async update(id: string, site: Partial<Omit<ProjectSite, 'id' | 'created_at' | 'updated_at'>>): Promise<ProjectSite> {
    const { data, error } = await supabase
      .from('project_sites')
      .update(site)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project site:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from update');
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_sites')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project site:', error);
      throw error;
    }
  }
}; 