'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { glassInputClassName } from './ui/styles';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface Suggestion {
  place_name: string;
  center: [number, number];
}

export function SearchBar({ value, onChange, onSearch, isLoading, error }: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value.trim() || value.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            value
          )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=place,region,country&limit=5`
        );

        if (!response.ok) throw new Error('Failed to fetch suggestions');

        const data = await response.json();
        setSuggestions(data.features);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.place_name);
    onSearch(suggestion.place_name);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <Input
          type="text"
          placeholder="Search for a location..."
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className={`w-full py-2 md:py-3 lg:py-4 pr-12 ${glassInputClassName}`}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 rounded-l-none"
        >
          <Search className={`h-5 w-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-900/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white/5">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={`w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 transition-colors ${
                  index === selectedIndex ? 'bg-white/20' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
                <span className="truncate">{suggestion.place_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="absolute -bottom-6 left-0 text-sm text-red-500 bg-black/80 px-2 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
} 