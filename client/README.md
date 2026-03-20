# Gram Sahayak — Frontend

React-based single-page application for the Gram Sahayak village governance platform.

## Tech Stack

- **React 19** with Vite for fast development and optimized builds
- **Tailwind CSS** for utility-first styling with a custom earthy design system
- **Framer Motion** for smooth page transitions and micro-animations
- **React Router v7** for client-side routing with role-based navigation
- **Leaflet + React-Leaflet** for interactive maps and route visualization
- **Lucide React** for consistent iconography
- **Axios** for API communication
- **jsPDF** for client-side PDF report generation
- **i18next** for internationalization (English / Kannada)

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:8000
```

## Build for Production

```bash
npm run build
npm run preview     # Preview the production build locally
```

## Deployment

This app is deployed on **Vercel** with automatic builds from the `main` branch. The Vercel root directory is set to `client/`.
