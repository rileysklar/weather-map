import { useState } from 'react';
import { History, ChevronDown } from 'lucide-react';

interface ProjectSite {
  id: string;
  name: string;
  description: string;
  polygon: {
    coordinates: number[][][];
  };
}

interface SidebarProps {
  projectSites: ProjectSite[];
}

export function Sidebar({ projectSites }: SidebarProps) {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  return (
    <div className="space-y-4">
      <button 
        className={`w-full flex items-center justify-between text-md font-semibold text-white pb-2 cursor-pointer hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${isHistoryVisible ? 'border-b border-white/20' : ''}`}
        onClick={() => setIsHistoryVisible(!isHistoryVisible)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsHistoryVisible(!isHistoryVisible);
          }
        }}
        aria-expanded={isHistoryVisible}
        aria-controls="historical-data-content"
      >
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-400" aria-hidden="true" />
          <span>Historical Data</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 transition-transform duration-200 ${isHistoryVisible ? 'rotate-180' : ''}`} 
          aria-hidden="true"
        />
      </button>
      {isHistoryVisible && (
        <div id="historical-data-content">
          {projectSites.map((site) => (
            <div key={site.id} className="mb-4">
              <h3 className="text-sm font-medium text-white/80 mb-2">{site.name}</h3>
              {/* Temporarily commenting out HistoricalWeatherData until component is available */}
              {/* <HistoricalWeatherData siteId={site.id} days={7} /> */}
              <div className="text-white/60 text-sm">Historical data loading...</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 