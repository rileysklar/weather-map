import { supabase, type ProjectSite } from './supabase';

export const projectSitesService = {
  async create(site: Omit<ProjectSite, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('project_sites')
      .insert(site)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProjectSite;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('project_sites')
      .select('*');
    
    if (error) throw error;
    return data as ProjectSite[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('project_sites')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as ProjectSite;
  },

  async update(id: string, site: Partial<Omit<ProjectSite, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('project_sites')
      .update(site)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProjectSite;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('project_sites')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}; 