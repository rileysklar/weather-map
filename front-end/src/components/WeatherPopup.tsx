import { Card } from "@/components/ui/card";
import { ChevronDown, Building2, X } from "lucide-react";
import { useState } from "react";

interface WeatherPopupProps {
  weatherData: {
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
      pressure: number;
    };
    weather: Array<{
      description: string;
    }>;
    wind: {
      speed: number;
      gust?: number;
    };
    sys: {
      sunrise: number;
      sunset: number;
      country?: string;
    };
    visibility: number;
    clouds: {
      all: number;
    };
    rain?: {
      '1h': number;
    };
    snow?: {
      '1h': number;
    };
    name?: string;
  };
  locationName?: string;
  onCreateProjectSite?: () => void;
}

export function WeatherPopup({ weatherData, locationName, onCreateProjectSite }: WeatherPopupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="w-[350px] bg-black/20 border-white/20 text-white p-4 space-y-4 relative">
      <button
        className="absolute right-4 top-4 h-8 w-8 p-1.5 text-white/80 hover:bg-white/20 rounded-md transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/20"
        onClick={() => {
          const closeButton = document.querySelector('.mapboxgl-popup-close-button');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
          }
        }}
        aria-label="Close weather popup"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="space-y-2 pr-8">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xl">{locationName || weatherData.name || 'Current Location'}</h3>
          <span className="text-2xl" aria-label={`Temperature: ${Math.round(weatherData.main.temp)}°F`}>{Math.round(weatherData.main.temp)}°F</span>
        </div>
        <div className="flex items-center justify-between text-sm text-white/80">
          <span>Feels like {Math.round(weatherData.main.feels_like)}°F</span>
          <span>{weatherData.weather[0].description}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-white/80">
        <div>
          <div>Wind: {Math.round(weatherData.wind.speed)} mph</div>
          <div>Humidity: {weatherData.main.humidity}%</div>
        </div>
        <div className="text-right">
          <div>Sunrise: {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div>Sunset: {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      <button
        className="w-full bg-emerald-500 hover:bg-emerald-500/60 text-white font-medium py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
        onClick={onCreateProjectSite}
      >
        <Building2 className="w-4 h-4" aria-hidden="true" />
        Create New Project Site Here
      </button>

      <button
        className="w-full flex items-center justify-between text-sm text-white/60 hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md p-2"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="weather-details"
      >
        <span>More details</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          aria-hidden="true"
        />
      </button>

      {isExpanded && (
        <div id="weather-details" className="space-y-2 text-sm text-white/80 pt-2 border-t border-white/10">
          <div className="flex justify-between">
            <span>Pressure</span>
            <span>{weatherData.main.pressure} hPa</span>
          </div>
          <div className="flex justify-between">
            <span>Visibility</span>
            <span>{(weatherData.visibility / 1000).toFixed(1)} km</span>
          </div>
          <div className="flex justify-between">
            <span>Cloud Cover</span>
            <span>{weatherData.clouds.all}%</span>
          </div>
          {weatherData.rain && (
            <div className="flex justify-between">
              <span>Rain (1h)</span>
              <span>{weatherData.rain['1h']} mm</span>
            </div>
          )}
          {weatherData.snow && (
            <div className="flex justify-between">
              <span>Snow (1h)</span>
              <span>{weatherData.snow['1h']} mm</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
} 