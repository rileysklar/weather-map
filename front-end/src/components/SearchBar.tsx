'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { glassInputClassName } from './ui/styles';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function SearchBar({ value, onChange, onSearch, isLoading, error }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Input
        type="text"
        placeholder="Search for a location..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full py-2 md:py-3 lg:py-4 pr-12 ${glassInputClassName}`}
      />
      <Button
        type="submit"
        disabled={isLoading}
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10"
      >
        <Search className={`h-5 w-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
      {error && (
        <p className="absolute -bottom-6 left-0 text-sm text-red-500 bg-black/80 px-2 py-1 rounded">
          {error}
        </p>
      )}
    </form>
  );
} 