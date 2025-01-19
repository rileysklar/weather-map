'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { glassClassName, glassCardClassName, glassInputClassName } from '@/components/ui/styles';

interface ProjectSiteFormProps {
  isDrawing: boolean;
  currentPolygon: Array<{ id: string; coordinates: number[]; index: number }>;
  onSubmit: (data: { name: string; description: string; polygon: number[][] }) => void;
  onCancel: () => void;
}

export default function ProjectSiteForm({ 
  isDrawing = false, 
  currentPolygon = [], 
  onSubmit, 
  onCancel 
}: ProjectSiteFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a name for the project site');
      return;
    }

    if (!currentPolygon || currentPolygon.length < 3) {
      setError('Please select at least 3 points on the map to create a polygon');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      polygon: currentPolygon.map(point => point.coordinates)
    });
  };

  // Render coordinates table only if we have valid points
  const renderCoordinatesTable = () => {
    if (!currentPolygon || currentPolygon.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No points added yet
        </div>
      );
    }

    return (
      <table className="w-full text-sm">
        <thead className="bg-gray-50/50 sticky top-0">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">Longitude</th>
            <th className="px-4 py-2 text-left">Latitude</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentPolygon.map(point => (
            <tr key={point.id}>
              <td className="px-4 py-2">{point.index}</td>
              <td className="px-4 py-2">{point.coordinates[0].toFixed(6)}</td>
              <td className="px-4 py-2">{point.coordinates[1].toFixed(6)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <Card className="w-full backdrop-blur-sm border-white/20">
      <CardHeader className="flex flex-col  space-y-0 pb-2">
        <div className='flex flex-row justify-between'><CardTitle className="text-xl font-bold">New Project Site</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8 p-0 text-white hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
        </div>
         <div className="pt-2">
            {isDrawing ? (
              <p className="text-sm text-blue-400">
                Click on the map to draw a polygon. Click the first point to close the shape.
              </p>
            ) : currentPolygon && currentPolygon.length > 0 ? (
              <p className="text-sm text-green-400">
                ✓ Polygon drawn with {currentPolygon.length} points
              </p>
            ) : (
              <p className="text-sm text-white/70">
                Click "Start Drawing" to begin creating your polygon
              </p>
            )}
          </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Site Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter site name"
              className={glassInputClassName}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter site description"
              className={`min-h-[100px] ${glassInputClassName}`}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Polygon Points</Label>
            <div className={`max-h-[200px] overflow-y-auto rounded-md ${glassCardClassName}`}>
              {renderCoordinatesTable()}
            </div>
          </div>
         
          {error && (
            <div className="text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className={`${glassClassName} hover:bg-white/10`}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name || !description || !currentPolygon || currentPolygon.length < 3}
              className="bg-blue-500/50 hover:bg-blue-500/60 text-white"
            >
              Create Site
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 