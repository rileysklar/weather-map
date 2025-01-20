# Weather Map Application

A modern weather visualization application that combines real-time weather data from the National Weather Service API with an interactive map interface. The project uses a monorepo structure separating the front-end application from the database layer.

## Features

- Interactive map interface with Mapbox GL
- Real-time weather data visualization
- Location search functionality
- Weather data caching using Supabase
- Responsive design for all devices

## Project Structure

```
weather-map/
├── frontend/           # Next.js application
│   ├── src/
│   └── ...
├── database/          # Supabase and PostGIS
│   ├── migrations/
│   ├── types/
│   └── scripts/
└── README.md
```

## Prerequisites

- Node.js (v18 or later)
- Docker
- Supabase CLI
- Git

## Getting Started

### 1. Database Setup (Supabase)

```bash
# Install Supabase CLI
npm install supabase --save-dev

# Initialize Supabase project in the database directory
cd database
npx supabase init

# Start Supabase services locally
npx supabase start

# Generate database types
npx supabase gen types typescript --local > ../frontend/src/types/database.ts
```

### 2. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database (.env)
```
SUPABASE_DB_HOST=localhost
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=postgres
```

## Development

### Database Migrations

```bash
cd database
npx supabase migration new my_migration
npx supabase migration up
```

### Type Generation

```bash
npx supabase gen types typescript --local > ../frontend/src/types/database.ts
```

## API Integration

The application integrates with the National Weather Service API to fetch real-time weather data. Key endpoints used:

- `/points/{lat},{lon}` - Get metadata for a location
- `/gridpoints/{office}/{grid x},{grid y}/forecast` - Get forecast data
- `/gridpoints/{office}/{grid x},{grid y}/forecast/hourly` - Get hourly forecast

## Deployment

### Database
```bash
cd database
npx supabase db push
```

### Frontend
```bash
cd frontend
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- National Weather Service API
- Mapbox GL JS
- Supabase
- Next.js team
- PostGIS contributors 