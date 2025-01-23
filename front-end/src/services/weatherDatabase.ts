import { supabase } from '@/services/supabase';
import { WeatherAlert } from '@/services/weather';
import { SupabaseClient } from '@supabase/supabase-js';

export interface StoredWeatherData {
  id: string;
  site_id: string;
  temperature: number;
  precipitation_probability: number;
  wind_speed: string;
  alerts: WeatherAlert[];
  risk_score: number;
  risk_level: string;
  risk_color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWeatherData {
  site_id: string;
  temperature: number;
  precipitation_probability: number;
  wind_speed: string;
  alerts: WeatherAlert[];
  risk_score: number;
  risk_level: string;
  risk_color: string;
}

export const weatherDatabaseService = {
  async create(data: CreateWeatherData): Promise<StoredWeatherData> {
    const { data: weatherData, error } = await supabase
      .from('weather_data')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating weather data:', error);
      throw new Error(error.message);
    }

    return weatherData;
  },

  async getLatestForSite(siteId: string): Promise<StoredWeatherData | null> {
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching latest weather data:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async getAllLatest(): Promise<StoredWeatherData[]> {
    // Get the latest weather data for all sites
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching all latest weather data:', error);
      throw new Error(error.message);
    }

    return data || [];
  },

  async getHistoricalForSite(siteId: string, days: number = 7): Promise<StoredWeatherData[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .eq('site_id', siteId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching historical weather data:', error);
      throw new Error(error.message);
    }

    return data || [];
  },

  async deleteBySiteId(siteId: string): Promise<void> {
    const { error } = await supabase
      .from('weather_data')
      .delete()
      .eq('site_id', siteId);

    if (error) {
      console.error('Error deleting weather data:', error);
      throw new Error(error.message);
    }
  }
}; 