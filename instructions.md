### **Instruction Guide for Building an App to Overlay Election Data on an Interactive Map**

I need you to build an app step-by-step until it is fully functional. The app should **overlay precinct-level election data from the 2024 U.S. General Election onto an interactive map**. The app will allow users to:

1. View precinct boundaries and election results data overlaid on a map.
2. Interact with the map (zoom, pan, and click to view data for specific precincts).
3. Filter election data by state, county, and outcome.
4. Export data for selected regions in CSV or GeoJSON format.
5. Toggle between datasets for different election years (e.g., 2024 vs. 2020).

Use **Next.js for the frontend**, **Node.js for the backend**, and **PostGIS (PostgreSQL with GIS extension)** for the database. Start by integrating the base map with Mapbox, then add data overlays, filtering, and export functionality.

For each feature:

1. **Write and explain the code.**
2. **Test the feature to ensure it works as expected.**
3. **Debug any issues that arise.**
4. **Summarize what was implemented and ask if changes or refinements are needed before proceeding.**

Continue building, testing, and refining until all features are complete. Once the app is finished, prepare it for deployment to **Vercel** and provide documentation for setup and usage.

---

### **Step-by-Step Features**

#### **Feature 1: Display Base Map**
1. Install `mapbox-gl` and related dependencies.
2. Set up the environment variable for the Mapbox token in `.env.local`.
3. Create a reusable `Map` component to render the interactive map.
4. Test that the map is displayed and interactive (zoom, pan).

---

#### **Feature 2: Overlay Precinct Boundaries**
1. Fetch GeoJSON data for precinct boundaries from an API or local file.
2. Add a Mapbox data layer to display the boundaries on the map.
3. Style the precincts dynamically based on election results.

---

#### **Feature 3: Interactive Map Features**
1. Implement click events on precincts to display election data in a sidebar or popup.
2. Add hover effects to highlight the precinct being interacted with.

---

#### **Feature 4: Filtering Election Data**
1. Create a filter component with dropdowns for state, county, and outcome.
2. Implement API endpoints to fetch filtered GeoJSON data from the database.
3. Update the map dynamically based on the selected filters.

---

#### **Feature 5: Data Export**
1. Add an export button to download the data for selected precincts in CSV or GeoJSON format.
2. Test the export functionality with different data selections.

---

#### **Feature 6: Toggle Between Datasets**
1. Load and manage multiple datasets (e.g., 2024 and 2020 election data).
2. Add a toggle switch or dropdown to switch between datasets and update the map accordingly.

---

### **Deployment and Documentation**
1. Deploy the app to **Vercel** for the frontend and **Heroku** or **Railway** for the backend and database.
2. Provide documentation on:
   - Setting up the environment variables.
   - Seeding the database with precinct and election data.
   - Configuring the API and deploying to production.

---

