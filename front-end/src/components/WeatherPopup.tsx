import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronDown, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface WeatherPopupProps {
  weatherData: any;
  locationName?: string;
}

export function WeatherPopup({ weatherData, locationName }: WeatherPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card className="border-none text-white w-[350px] font-sans relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-0 -right-0 h-8 w-8 p-0 text-black hover:bg-white/20 rounded-md"
        onClick={() => {
          const closeButton = document.querySelector('.mapboxgl-popup-close-button');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
          }
        }}
      >
        <X className="h-4 w-4 text-white" />
      </Button>
      <CardHeader className="border-b border-white/20 pb-2 space-y-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-medium">
            {locationName || weatherData.name || 'Location'}, {weatherData.sys.country}
          </CardTitle>
 
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody className="divide-y divide-white/20">
            <TableRow>
              <TableCell className="py-3 font-medium">Lat/Lon</TableCell>
              <TableCell className="py-3 text-right">{weatherData.coord.lat.toFixed(4)}°N, {weatherData.coord.lon.toFixed(4)}°W</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3 font-medium">Sunrise</TableCell>
              <TableCell className="py-3 text-right">{formatTime(weatherData.sys.sunrise)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3 font-medium">Sunset</TableCell>
              <TableCell className="py-3 text-right">{formatTime(weatherData.sys.sunset)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3 font-medium">Temperature</TableCell>
              <TableCell className="py-3 text-right">{Math.round(weatherData.main.temp)}°F (Feels like {Math.round(weatherData.main.feels_like)}°F)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3 font-medium">Wind</TableCell>
              <TableCell className="py-3 text-right">{Math.round(weatherData.wind.speed)} mph {weatherData.wind.gust ? `(Gusts ${Math.round(weatherData.wind.gust)} mph)` : ''}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2} className="py-3">
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 font-medium hover:text-blue-300 w-full">
                    Detailed Conditions
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 space-y-2 pl-4 border-l border-white/20">
                      <div className="flex justify-between">
                        <span>Humidity</span>
                        <span>{weatherData.main.humidity}%</span>
                      </div>
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
                      <div className="flex justify-between">
                        <span>Conditions</span>
                        <span>{weatherData.weather[0].description.replace(/\b\w/g, (char: string) => char.toUpperCase())}</span>
                      </div>
                      <Button
            variant="link"
            size="sm"
            className="text-blue-300 hover:text-blue-400 p-0 h-auto"
            asChild
          >
            <a
              href={`https://en.wikipedia.org/wiki/${encodeURIComponent(locationName || weatherData.name)}${weatherData.name.includes(',') ? '_' + weatherData.name.split(',')[1].trim() : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View on Wikipedia"
            >
              Wiki <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 