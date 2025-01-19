# Weather Map

An interactive weather visualization application built with Next.js and Mapbox GL JS. The application provides real-time weather data for any location on the map with a beautiful, modern interface.

## Features

- 🗺️ Interactive map powered by Mapbox GL JS
- 🌡️ Real-time weather data from OpenWeather API
- 🔍 Location search with auto-geocoding
- 💫 Smooth animations and transitions
- 🎨 Modern UI with glassmorphism effects
- 📱 Fully responsive design
- ⚡ Server-side API route handling
- 🌓 Dark/Light mode support

## Weather Data Display

- Temperature (current and feels like)
- Wind speed and gusts
- Sunrise and sunset times
- Humidity and pressure
- Visibility and cloud cover
- Detailed weather conditions
- Wikipedia links for locations

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager
- Mapbox API token
- OpenWeather API key

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/weather-map.git
cd weather-map
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Framework**: Next.js 15.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map**: Mapbox GL JS
- **Weather Data**: OpenWeather API
- **State Management**: React Hooks
- **Build Tool**: Turbopack
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes for weather and geocoding
│   ├── globals.css    # Global styles and Tailwind imports
│   ├── layout.tsx     # Root layout component
│   └── page.tsx       # Home page component
├── components/
│   ├── Map.tsx       # Main map component
│   └── LoadingScreen.tsx # Loading animation component
```

## Development

- Uses ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting
- Hot reloading with Turbopack

## Deployment

The application is optimized for deployment on Vercel:

```bash
npm run build
# or
yarn build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) for the mapping platform
- [OpenWeather API](https://openweathermap.org/api) for weather data
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
