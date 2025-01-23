CREATE OR REPLACE FUNCTION public.create_weather_data_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.weather_data (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id uuid REFERENCES public.project_sites(id) ON DELETE CASCADE,
    data jsonb NOT NULL,
    last_updated timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS weather_data_site_id_idx ON public.weather_data(site_id);
  CREATE INDEX IF NOT EXISTS weather_data_last_updated_idx ON public.weather_data(last_updated);

  ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Enable read access for authenticated users"
    ON public.weather_data
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Enable all access for service role"
    ON public.weather_data
    TO service_role
    USING (true)
    WITH CHECK (true);
END;
$$; 