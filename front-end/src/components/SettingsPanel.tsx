import React, { useEffect, useState } from 'react';
import { Settings, X, Thermometer } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TemperatureUnit, getStoredTemperatureUnit, setStoredTemperatureUnit } from '@/utils/temperature';

interface AlertPreferences {
  warnings: boolean;
  watches: boolean;
  advisories: boolean;
  statements: boolean;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alertPreferences: AlertPreferences;
  onAlertPreferencesChange: (preferences: AlertPreferences) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  alertPreferences,
  onAlertPreferencesChange
}: SettingsPanelProps) {
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('F');

  useEffect(() => {
    setTemperatureUnit(getStoredTemperatureUnit());
  }, []);

  if (!isOpen) return null;

  const handleSwitchChange = (key: keyof AlertPreferences) => (checked: boolean) => {
    onAlertPreferencesChange({ ...alertPreferences, [key]: checked });
  };

  const handleTemperatureUnitChange = (checked: boolean) => {
    const newUnit: TemperatureUnit = checked ? 'C' : 'F';
    setTemperatureUnit(newUnit);
    setStoredTemperatureUnit(newUnit);
  };

  return (
    <div className={`h-full flex flex-col ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'} transition-all delay-100 duration-300`}>
      {/* Header */}
      <div className="flex-none p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <div className="space-y-6">
            {/* Display Settings Section */}
            <div>
              <h3 className="text-white text-sm font-medium mb-4">Display Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-white/80" />
                    <Label htmlFor="temperature-unit" className="text-white/90">Use Celsius</Label>
                  </div>
                  <Switch
                    id="temperature-unit"
                    checked={temperatureUnit === 'C'}
                    onCheckedChange={handleTemperatureUnitChange}
                  />
                </div>
              </div>
            </div>

            {/* Alert Preferences Section */}
            <div>
              <h3 className="text-white text-sm font-medium mb-4">Alert Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="warnings" className="text-white/90">Warnings</Label>
                  <Switch
                    id="warnings"
                    checked={alertPreferences.warnings}
                    onCheckedChange={handleSwitchChange('warnings')}
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="watches" className="text-white/90">Watches</Label>
                  <Switch
                    id="watches"
                    checked={alertPreferences.watches}
                    onCheckedChange={handleSwitchChange('watches')}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="advisories" className="text-white/90">Advisories</Label>
                  <Switch
                    id="advisories"
                    checked={alertPreferences.advisories}
                    onCheckedChange={handleSwitchChange('advisories')}
                    className="data-[state=checked]:bg-yellow-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="statements" className="text-white/90">Statements</Label>
                  <Switch
                    id="statements"
                    checked={alertPreferences.statements}
                    onCheckedChange={handleSwitchChange('statements')}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 