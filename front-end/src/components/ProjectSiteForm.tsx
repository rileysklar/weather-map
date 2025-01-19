'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface ProjectSiteFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
  isDrawing: boolean;
  currentPolygon: number[][];
}

export function ProjectSiteForm({ 
  onSuccess, 
  onError, 
  onCancel,
  isDrawing,
  currentPolygon 
}: ProjectSiteFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentPolygon.length < 3) {
      onError('Please draw a polygon with at least 3 points');
      return;
    }

    try {
      const response = await fetch('/api/project-sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          polygon: {
            type: 'Polygon',
            coordinates: [[...currentPolygon, currentPolygon[0]]] // Close the polygon
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create project site');
      }

      setName('');
      setDescription('');
      onSuccess();
    } catch (error) {
      console.error('Error creating project site:', error);
      onError('Failed to create project site');
    }
  };

  return (
    <Card className="w-96 absolute top-4 right-4 bg-white/90 backdrop-blur-sm border-white/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">New Project Site</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Site Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter site name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter site description"
              className="min-h-[100px]"
              required
            />
          </div>
          <div className="pt-2">
            {isDrawing ? (
              <p className="text-sm text-blue-600">
                Click on the map to draw a polygon. Click the first point to close the shape.
              </p>
            ) : currentPolygon.length > 0 ? (
              <p className="text-sm text-green-600">
                ✓ Polygon drawn with {currentPolygon.length} points
              </p>
            ) : (
              <p className="text-sm text-stone-600">
                Click "Start Drawing" to begin creating your polygon
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name || !description || currentPolygon.length < 3}
            >
              Create Site
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 