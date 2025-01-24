import { projectSitesService } from './projectSites';
import { GeometryObject, Polygon } from 'geojson';

interface ImportedSite {
  name: string;
  description: string;
  polygon: Polygon;
  created_at?: string;
}

interface ImportData {
  version: string;
  exportDate: string;
  sites: ImportedSite[];
}

export const projectImportService = {
  /**
   * Checks if a site already exists based on name and polygon coordinates
   */
  async checkDuplicate(site: ImportedSite): Promise<boolean> {
    try {
      const existingSites = await projectSitesService.getAll();
      
      return existingSites.some(existingSite => {
        // Check if names match
        const nameMatch = existingSite.name.toLowerCase() === site.name.toLowerCase();
        
        // Check if polygons match (compare first coordinate as a simple check)
        const existingPolygon = existingSite.polygon as Polygon;
        const polygonMatch = JSON.stringify(existingPolygon.coordinates[0][0]) === 
                           JSON.stringify(site.polygon.coordinates[0][0]);
        
        return nameMatch || polygonMatch;
      });
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  },

  /**
   * Validates and parses the imported JSON file
   */
  parseImportFile: async (file: File): Promise<ImportData> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Basic validation
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid import file format');
      }
      
      if (!Array.isArray(data.sites)) {
        throw new Error('No sites found in import file');
      }
      
      // Validate each site has required fields
      data.sites.forEach((site: any, index: number) => {
        if (!site.name || typeof site.name !== 'string') {
          throw new Error(`Site at index ${index} is missing a valid name`);
        }
        if (!site.polygon || !site.polygon.type || !site.polygon.coordinates) {
          throw new Error(`Site "${site.name}" has invalid polygon data`);
        }
      });
      
      return data as ImportData;
    } catch (error) {
      console.error('Error parsing import file:', error);
      throw new Error('Failed to parse import file: ' + (error as Error).message);
    }
  },

  /**
   * Imports sites to the database
   */
  importSites: async (data: ImportData): Promise<{ 
    success: number; 
    failed: number; 
    skipped: number;
    errors: { name: string; error: string }[] 
  }> => {
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as { name: string; error: string }[]
    };

    // Process each site
    for (const site of data.sites) {
      try {
        // Check for duplicates before importing
        const isDuplicate = await projectImportService.checkDuplicate(site);
        
        if (isDuplicate) {
          results.skipped++;
          results.errors.push({
            name: site.name,
            error: 'Site already exists (skipped)'
          });
          continue;
        }

        await projectSitesService.create({
          name: site.name,
          description: site.description || '',
          polygon: site.polygon
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          name: site.name,
          error: (error as Error).message
        });
      }
    }

    return results;
  },

  /**
   * Handles the complete import process from file to database
   */
  handleImport: async (file: File): Promise<{ 
    success: number; 
    failed: number;
    skipped: number;
    errors: { name: string; error: string }[] 
  }> => {
    try {
      const importData = await projectImportService.parseImportFile(file);
      return await projectImportService.importSites(importData);
    } catch (error) {
      throw new Error('Import failed: ' + (error as Error).message);
    }
  }
}; 