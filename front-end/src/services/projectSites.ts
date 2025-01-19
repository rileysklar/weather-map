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

class ProjectSitesService {
  async create(data: CreateProjectSite): Promise<ProjectSite> {
    const { data: newSite, error } = await supabase
      .from('project_sites')
      .insert([{
        name: data.name,
        description: data.description,
        polygon: data.polygon,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating project site:', error);
      throw error;
    }

    if (!newSite) {
      throw new Error('No data returned from insert');
    }

    return newSite;
  }

  async getAll(): Promise<ProjectSite[]> {
    const { data, error } = await supabase
      .from('project_sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project sites:', error);
      throw error;
    }

    return data || [];
  }

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
  }

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
  }

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
}

export const projectSitesService = new ProjectSitesService(); 