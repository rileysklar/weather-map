# MapShield - Weather Risk Assessment Platform

MapShield is a sophisticated web application that helps organizations monitor and assess weather-related risks for their project sites across the United States. The platform combines interactive mapping, real-time weather data, and comprehensive risk assessment tools to provide actionable insights for asset protection.

## Core Features

### Interactive Map Interface
- **Dynamic Map Navigation**: Pan, zoom, and explore project sites across the United States
- **Site Visualization**: 
  - Project sites displayed with custom polygons
  - Color-coded based on alert status (blue for normal, red for active alerts)
  - Site names always visible for easy identification
  - Active weather alerts displayed beneath site names

### Project Site Management
- **Site Creation**:
  - Interactive polygon drawing tool
  - Custom site naming and description
  - Automatic coordinate capture
- **Site Editing**:
  - Update site names and descriptions
  - Immediate UI updates across all components
- **Site Deletion**:
  - Remove sites with confirmation
  - Automatic cleanup of associated weather data

### Weather Monitoring
- **Real-time Weather Data**:
  - Temperature readings
  - Precipitation probability
  - Wind speed measurements
  - Active weather alerts
- **Weather Popup**:
  - Click anywhere on map for instant weather information
  - Option to create new project site from location
- **Location Search**:
  - Search for specific locations
  - Automatic map centering and weather display

### Risk Assessment
- **Comprehensive Risk Analysis**:
  - Weather alert severity evaluation
  - Precipitation risk assessment
  - Wind damage probability
  - Combined risk score calculation
- **Visual Risk Indicators**:
  - Risk level badges (Low to Severe)
  - Radar charts for risk factor breakdown
  - Progress bars for risk scores
- **Alert Management**:
  - Configurable alert preferences
  - Filter by warning types (Warnings, Watches, Advisories, Statements)
  - Expandable alert details

### Active Alerts Dashboard
- **Alert Overview**:
  - Real-time alert monitoring
  - Alert type categorization
  - Severity indicators
  - Site-specific alert tracking
- **Alert Navigation**:
  - Click-through to affected sites
  - Automatic map centering on alert locations
  - Quick access to detailed risk assessments

### User Interface
- **Responsive Sidebar**:
  - Collapsible interface
  - Project site listing
  - Risk assessment views
  - Alert monitoring
- **Search Functionality**:
  - Location-based search
  - Site name search
  - Alert filtering
- **Dynamic Updates**:
  - Real-time data refresh
  - Immediate UI feedback
  - Smooth transitions and animations

## Technical Features
- Built with Next.js and React
- Mapbox GL JS for mapping functionality
- OpenWeather API integration
- Supabase backend for data storage
- TypeScript for type safety
- Tailwind CSS for styling

## Data Integration
- **Weather Data**:
  - OpenWeather API for current conditions
  - NOAA integration for weather alerts
  - Automatic data updates
- **Geospatial Data**:
  - Custom polygon support
  - Coordinate system management
  - Boundary calculations

## Security Features
- Environment variable protection
- API key management
- Secure data storage
- Error handling and validation

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Requirements
- Node.js 16+
- NPM or Yarn
- Modern web browser with WebGL support
- Internet connection for API access

## API Dependencies
- Mapbox GL JS
- OpenWeather API
- Supabase

## Contributing
Contributions are welcome! Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details. 