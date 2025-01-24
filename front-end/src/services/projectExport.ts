interface ProjectSite {
  id: string;
  name: string;
  description: string;
  polygon: {
    type: string;
    coordinates: number[][][];
  };
  created_at: string;
}

export const projectExportService = {
  /**
   * Exports project sites to a JSON file and triggers download
   */
  exportToJson: (sites: ProjectSite[]) => {
    try {
      // Format the data for export
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        sites: sites.map(site => ({
          name: site.name,
          description: site.description,
          polygon: site.polygon,
          created_at: site.created_at
        }))
      };

      // Convert to JSON string with pretty formatting
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `mapshield-sites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting project sites:', error);
      throw new Error('Failed to export project sites');
    }
  },

  /**
   * Validates the structure of imported project sites data
   */
  validateImportData: (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.sites)) return false;
    
    return data.sites.every((site: any) => (
      site.name &&
      typeof site.name === 'string' &&
      site.polygon &&
      site.polygon.type === 'Polygon' &&
      Array.isArray(site.polygon.coordinates)
    ));
  }
}; 