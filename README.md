# Radio Line of Sight (LOS) Tool

A high-performance, mobile-responsive static web application for radio operators to assess line-of-sight visibility between two points, accounting for Earth curvature and antenna heights.

## Features
- **Topographic & Dark Maps:** Switch between detailed terrain contours and night-friendly dark tiles.
- **Radio Propagation (k=4/3):** Standard atmospheric refraction model for VHF/UHF radio wave propagation.
- **Fresnel Zone Visualization:** Enter frequency (MHz) to display the 60% Fresnel zone clearance envelope on the elevation profile. Paths with insufficient clearance are flagged as "Fresnel Risk."
- **Maidenhead Grid Locator:** Displays the 6-character grid square for both points in real-time.
- **Elevation Profiles:** Visualizes raw terrain, Earth curvature "bulge," and the LOS ray.
- **Mobile Optimized:** Touch-friendly bottom sheet UI for fieldwork on smartphones and tablets.
- **Search & Localization:** Find places quickly or use your device's GPS to set your location.
- **Accurate Metrics:** Real-time distance and reciprocal bearing (A→B, B→A) calculations.

## Deployment to GitHub Pages

This project is ready for deployment. To host it yourself:
1.  Push this code to your own GitHub repository.
2.  Go to **Settings** > **Pages** in your GitHub repository.
3.  Under **Build and deployment** > **Source**, select **GitHub Actions**.
4.  The included workflow in `.github/workflows/deploy.yml` will automatically build and deploy your site on every push.

## Usage
1.  Select **Point A** in the sidebar (or bottom sheet).
2.  Click/tap on the map to set your location.
3.  Select **Point B** and set the target location.
4.  Adjust **Antenna Heights** if needed.
5.  Click **CALCULATE** to fetch elevation data and see the LOS profile.

## Dependencies
- [Leaflet.js](https://leafletjs.com/) (Maps)
- [Chart.js](https://www.chartjs.org/) (Elevation Profiles)
- [DaisyUI](https://daisyui.com/) & [Tailwind CSS](https://tailwindcss.com/) (UI)
- [Turf.js](https://turfjs.org/) (Geospatial Math)
- [Open-Meteo Elevation API](https://open-meteo.com/en/docs/elevation-api) (Terrain Data)
