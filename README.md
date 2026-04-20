# Smart Restaurant Powered By AI

A full-stack restaurant operations web product built with the MERN stack. It combines branch management, menu control, reservations, food ordering, reports, and AI-assisted workflows in one polished multi-role platform.

## Live Demo

- Production app: [https://smart-restaurant-powered-by-ai.vercel.app](https://smart-restaurant-powered-by-ai.vercel.app)
- API health check: [https://smart-restaurant-powered-by-ai.vercel.app/api/health](https://smart-restaurant-powered-by-ai.vercel.app/api/health)

## Demo Accounts

- Super Admin: `superadmin@smartdine.ai` / `password123`
- Restaurant Admin: `admin@urbanbites.com` / `password123`
- Staff: `staff@urbanbites.com` / `password123`
- Guest User: `guest@example.com` / `password123`

## What This Product Includes

- Role-based authentication with JWT
- Super Admin, Restaurant Admin, Staff, and Guest experiences
- Dashboard with operational KPIs and analytics
- Restaurant, menu, table, booking, order, reservation, and user CRUD
- Guest-facing booking and ordering pages
- AI food recommendations
- AI customer support assistant
- Busy-hour and sales insight modules
- MongoDB seed data for a ready-to-demo setup
- Vercel-ready frontend and API deployment setup

## Tech Stack

- React
- Vite
- Tailwind CSS
- Node.js
- Express
- MongoDB
- Mongoose
- JWT

## Project Structure

```text
smart-restaurant-powered-by-ai/
|-- api/
|   `-- index.js
|-- client/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- data/
|   |   |-- pages/
|   |   `-- utils/
|   |-- .env.example
|   `-- package.json
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- seed/
|   |   `-- services/
|   |-- .env.example
|   `-- package.json
|-- docker-compose.yml
|-- package.json
|-- vercel.json
`-- README.md
```

## Main Modules

- Authentication
- Dashboard
- Restaurant Management
- Menu Management
- Table Booking
- Food Ordering
- Reservation Management
- User Management
- Reports and Analytics

## AI Modules

- Food Recommendation System
- Customer Support Assistant
- Sales and Busy-Hour Insights

## Local Setup

### 1. Install dependencies

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Configure environment files

Create these files from the provided examples:

- `server/.env`
- `client/.env`

Default local examples already point to:

- Frontend: `http://127.0.0.1:5173`
- Backend API: `http://127.0.0.1:5050/api`
- MongoDB: `mongodb://127.0.0.1:27017/ai-smart-restaurant`

### 3. Seed data

```bash
npm run seed
```

### 4. Start the app

```bash
npm run dev
```

Local URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend API: `http://127.0.0.1:5050/api`

## Production Notes

The current production deployment is hosted on Vercel and connected to MongoDB Atlas.

Required environment variables for deployment:

- `DEMO_MODE=false`
- `MONGO_URI=your-mongodb-uri`
- `JWT_SECRET=your-secure-secret`
- `JWT_EXPIRE=30d`
- `CLIENT_URL=https://your-vercel-domain.vercel.app`

The frontend uses same-origin `/api` routes in production, so `VITE_API_BASE_URL` is not required on Vercel.

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard/summary`
- `GET /api/reports/overview`
- `GET /api/ai/insights`
- `POST /api/ai/recommendations`
- `POST /api/ai/chatbot`
- `GET/POST/PUT/DELETE /api/restaurants`
- `GET/POST/PUT/DELETE /api/menu-items`
- `GET/POST/PUT/DELETE /api/tables`
- `GET/POST/PUT/DELETE /api/bookings`
- `GET/POST/PUT/DELETE /api/orders`
- `GET/POST/PUT/DELETE /api/reservations`
- `GET/POST/PUT/DELETE /api/users`

## Deployment

### Vercel

This repo is configured so:

- `client/` builds the frontend
- `api/index.js` exposes the Express API as serverless routes
- frontend routes and `/api/*` work from the same domain

Deploy command used for production:

```bash
npx vercel deploy --prod
```

### Docker

```bash
docker compose up --build
```

Then seed data:

```bash
docker compose exec server npm run seed
```

## Presentation-Friendly Highlights

- Clean orange-and-white premium UI
- Real multi-page product flow for guests and admins
- Ready-to-use seeded data
- AI features that are easy to demonstrate live
- JWT session validity set to 30 days
- Suitable for demo, submission, and portfolio presentation
