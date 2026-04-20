# AI-Powered Smart Restaurant Management System

A complete MERN stack final year project with modern UI, dummy demo data, role-based access, CRUD modules, and AI-powered restaurant features.

## Tech Stack

- React + Vite + Tailwind CSS
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Recharts for analytics dashboards

## Roles

- Super Admin
- Restaurant Admin
- Staff
- Guest User

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
- Customer Support Chatbot
- Sales and Busy Hour Analytics

## Project Structure

```text
ai-powered-smart-restaurant-management-system/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   └── utils/
│   ├── Dockerfile
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── package.json
```

## Demo Credentials

- Super Admin: `superadmin@smartdine.ai` / `password123`
- Restaurant Admin: `admin@urbanbites.com` / `password123`
- Staff: `staff@urbanbites.com` / `password123`
- Guest User: `guest@example.com` / `password123`

## Local Setup

1. Copy `server/.env.example` to `server/.env`
2. Copy `client/.env.example` to `client/.env`
3. Install dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

4. Start MongoDB locally
5. Seed the database:

```bash
npm run seed
```

6. Run the full project:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend API: `http://localhost:5000/api`

## Docker Setup

1. Build and start services:

```bash
docker compose up --build
```

2. Seed the database:

```bash
docker compose exec server npm run seed
```

Frontend: `http://localhost:4173`

Backend API: `http://localhost:5000/api`

## Backend API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/restaurants`
- `GET/POST/PUT/DELETE /api/menu-items`
- `GET/POST/PUT/DELETE /api/tables`
- `GET/POST/PUT/DELETE /api/bookings`
- `GET/POST/PUT/DELETE /api/orders`
- `GET/POST/PUT/DELETE /api/reservations`
- `GET/POST/PUT/DELETE /api/users`
- `GET /api/dashboard/summary`
- `GET /api/reports/overview`
- `GET /api/ai/insights`
- `POST /api/ai/recommendations`
- `POST /api/ai/chatbot`

## Submission Notes

- Suitable for final year project demo and viva
- Contains dummy seeded data for instant presentation
- Includes responsive multi-page UI
- Covers CRUD for key restaurant management modules
- Includes clean dashboard visuals and AI demo features
