export type TemperatureUnit = 'F' | 'C';

export const convertTemperature = (temp: number, from: TemperatureUnit, to: TemperatureUnit): number => {
  if (from === to) return temp;
  if (from === 'F' && to === 'C') {
    return (temp - 32) * 5/9;
  }
  return (temp * 9/5) + 32;
};

const TEMP_UNIT_KEY = 'temperature-unit';

export const getStoredTemperatureUnit = (): TemperatureUnit => {
  if (typeof window === 'undefined') return 'F';
  return (localStorage.getItem(TEMP_UNIT_KEY) as TemperatureUnit) || 'F';
};

export const setStoredTemperatureUnit = (unit: TemperatureUnit) => {
  localStorage.setItem(TEMP_UNIT_KEY, unit);
}; 