"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RiskAssessment } from '@/components/risk-assessment/RiskAssessment';
import { HistoricalWeatherChart } from '@/components/HistoricalWeatherChart';
import { Building2, History, AlertTriangle } from 'lucide-react';
import { WeatherProvider } from '@/contexts/WeatherContext';

interface ProjectSiteDetailsProps {
  siteId: string;
  siteName: string;
  description: string;
  coordinates: number[][];
  created_at: string;
}

export function ProjectSiteDetails({
  siteId,
  siteName,
  description,
  coordinates,
  created_at
}: ProjectSiteDetailsProps) {
  const [activeTab, setActiveTab] = useState('current');

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
    <WeatherProvider>
      <Card className="w-full bg-white/5 border-white/20">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-medium">{siteName}</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-white/60 text-sm">Description</p>
              <p className="text-white/90">{description || 'No description provided'}</p>
            </div>
            
            <div>
              <p className="text-white/60 text-sm">Created</p>
              <p className="text-white/90">{formatDate(created_at)}</p>
            </div>
            
            <div>
              <p className="text-white/60 text-sm">Center Coordinates</p>
              <p className="text-white/90 font-mono text-sm">
                {coordinates[0][0].toFixed(4)}, {coordinates[0][1].toFixed(4)}
              </p>
            </div>
          </div>

          <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full bg-white/5 border-b border-white/10">
              <TabsTrigger 
                value="current"
                className="flex-1 data-[state=active]:bg-white/10"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Current
              </TabsTrigger>
              <TabsTrigger 
                value="historical"
                className="flex-1 data-[state=active]:bg-white/10"
              >
                <History className="h-4 w-4 mr-2" />
                Historical
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="mt-4">
              <RiskAssessment siteId={siteId} />
            </TabsContent>
            
            <TabsContent value="historical" className="mt-4">
              <HistoricalWeatherChart siteId={siteId} days={7} />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </WeatherProvider>
  );
} 