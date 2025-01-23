"use client";

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { weatherDatabaseService, StoredWeatherData } from '@/services/weatherDatabase';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoricalWeatherChartProps {
  siteId: string;
  days?: number;
}

export function HistoricalWeatherChart({ siteId, days = 7 }: HistoricalWeatherChartProps) {
  const [historicalData, setHistoricalData] = useState<StoredWeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        const data = await weatherDatabaseService.getHistoricalForSite(siteId, days);
        setHistoricalData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch historical weather data');
        console.error('Error fetching historical data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [siteId, days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  if (historicalData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/60">
        <p>No historical data available</p>
      </div>
    );
  }

  // Group and average data by date
  const groupedData = historicalData.reduce<{ [date: string]: {
    temperature: number[];
    precipitation: number[];
    risk: number[];
    count: number;
  }}>((acc, data) => {
    const date = new Date(data.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {
        temperature: [],
        precipitation: [],
        risk: [],
        count: 0
      };
    }
    acc[date].temperature.push(data.temperature);
    acc[date].precipitation.push(data.precipitation_probability);
    acc[date].risk.push(data.risk_score);
    acc[date].count++;
    return acc;
  }, {});

  // Calculate daily averages
  const dates = Object.keys(groupedData).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  const averages = dates.map(date => ({
    temperature: groupedData[date].temperature.reduce((a, b) => a + b, 0) / groupedData[date].count,
    precipitation: groupedData[date].precipitation.reduce((a, b) => a + b, 0) / groupedData[date].count,
    risk: groupedData[date].risk.reduce((a, b) => a + b, 0) / groupedData[date].count
  }));

  const chartData: ChartData<'line'> = {
    labels: dates,
    datasets: [
      {
        label: 'Temperature (°F)',
        data: averages.map(avg => avg.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3
      },
      {
        label: 'Precipitation Probability (%)',
        data: averages.map(avg => avg.precipitation),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3
      },
      {
        label: 'Risk Score',
        data: averages.map(avg => avg.risk),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          color: 'white',
          padding: 16,
          boxWidth: 40,
          boxHeight: 3,
          useBorderRadius: true,
          borderRadius: 2
        },
        margin: 24,
        maxWidth: 800,
        itemGap: 24,
        bottom: 12
      },
      title: {
        display: true,
        text: 'Historical Weather Trends',
        color: 'white',
        align: 'start' as const,
        padding: {
          top: 0,
          bottom: 8
        },
        font: {
          size: 16,
          weight: 'normal' as const
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white',
          padding: 8
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white',
          padding: 8
        }
      }
    }
  };

  return (
    <div className="">
      <div className="h-[400px] mt-2">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-medium">Weather History Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white/60">Average Temperature</p>
            <p className="font-medium">
              {(historicalData.reduce((acc, data) => acc + data.temperature, 0) / historicalData.length).toFixed(1)}°F
            </p>
          </div>
          <div>
            <p className="text-white/60">Average Risk Score</p>
            <p className="font-medium">
              {(historicalData.reduce((acc, data) => acc + data.risk_score, 0) / historicalData.length).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-white/60">Total Alerts</p>
            <p className="font-medium">
              {historicalData.reduce((acc, data) => acc + data.alerts.length, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 