import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ProjectSite = {
  id: string;
  name: string;
  description?: string;
  polygon: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  created_at: string;
  updated_at: string;
}; 