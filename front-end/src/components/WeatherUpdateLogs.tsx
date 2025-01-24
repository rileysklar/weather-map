import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface WeatherUpdateLog {
  id: number;
  created_at: string;
  status: 'success' | 'error';
  sites_updated: number;
  error_message?: string;
}

export default function WeatherUpdateLogs() {
  const [logs, setLogs] = useState<WeatherUpdateLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    // Subscribe to new logs
    const channel = supabase
      .channel('weather_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'weather_update_logs',
        },
        (payload) => {
          setLogs((current) => [payload.new as WeatherUpdateLog, ...current].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLogs() {
    try {
      const { data, error } = await supabase
        .from('weather_update_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching weather update logs:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-4">Loading logs...</div>;
  }

  return (
    <div className="p-4">
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-white/60">No weather updates yet</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg ${
                log.status === 'success' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  log.status === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {log.status === 'success' ? '✓' : '✗'} {log.sites_updated} sites updated
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              {log.error_message && (
                <p className="text-sm text-red-600 mt-1">{log.error_message}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 