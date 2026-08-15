# Orbit - Social Media Platform

A scalable social media application built with Next.js, Express, PostgreSQL, and Socket.io.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React, Shadcn/UI
- **Backend:** Node.js with Express, Socket.io
- **Database:** PostgreSQL with Prisma ORM
- **State Management:** React Query (TanStack Query), Zustand
- **Authentication:** JWT with HttpOnly cookies
- **Real-time:** Socket.io

## Project Structure

```
orbit/
├── backend/          # Express API server
├── frontend/         # Next.js application
├── prisma/           # Prisma schema
└── package.json      # Root package.json for workspace management
```

## Getting Started

For detailed setup instructions, see [SETUP.md](./SETUP.md)

### Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (see SETUP.md for details)

3. Set up the database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```

This will start:
- Backend server on `http://localhost:5000`
- Frontend application on `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only backend server
- `npm run dev:frontend` - Start only frontend application
- `npm run build` - Build both backend and frontend for production
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Features

- User registration and authentication
- Create posts (text, image, video)
- Like and comment on posts
- Follow/unfollow users
- Real-time messaging
- User profiles with avatars and bios

