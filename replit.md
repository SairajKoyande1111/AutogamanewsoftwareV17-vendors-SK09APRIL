# Auto Gamma Management CRM

## Overview
Auto Gamma Management CRM is a full-stack web application for managing an automotive service business. It handles customer relationships, job cards, invoicing, appointments, and master data management for services like paint protection film (PPF), sun control film, detailing, car accessories, and mechanical work.

## Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, Shadcn UI, Wouter (routing), TanStack React Query, Framer Motion, Recharts
- **Backend**: Express 5, Node.js
- **Database**: MongoDB (via Mongoose)
- **Session Store**: connect-mongodb-session
- **Auth**: Custom email/password authentication with express-session

## Project Structure
```
client/src/
  pages/          - Page components (login, dashboard, job-cards, customers, etc.)
  components/
    ui/           - Shadcn UI components
    layout/       - Layout components (sidebar, topbar, notifications)
  hooks/          - Custom hooks (use-auth, use-dashboard, use-toast)
  lib/            - Utility functions and query client setup
server/
  index.ts        - Express server entry point
  routes.ts       - API route definitions
  storage.ts      - MongoDB storage layer with Mongoose models
  db.ts           - MongoDB connection setup
  vite.ts         - Vite dev server integration
  static.ts       - Static file serving for production
shared/
  schema.ts       - Shared types and Zod schemas
  routes.ts       - Shared API route definitions
```

## Key Features
- Dashboard with KPI stats and charts
- Job card creation and management
- Customer database with search/filter
- Invoice generation with PDF export and WhatsApp sharing
- Appointment scheduling
- Inquiry tracking
- Technician management
- Master data management (services, PPF, accessories, vehicle types)
- User authentication with session management

## Environment Variables
- `MONGODB_URI` - MongoDB connection string (secret)
- `SESSION_SECRET` - Express session secret (secret)

## Running the Project
- Development: `npm run dev` (starts Express + Vite on port 5000)
- Build: `npm run build`
- Production: `npm run start`
