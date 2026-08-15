# Orbit Frontend

Next.js 14+ frontend application for the Orbit social media platform using the App Router.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   │   ├── layout.tsx     # Auth layout
│   │   ├── login/        # Login page
│   │   └── register/     # Register page
│   ├── (main)/            # Main app route group
│   │   ├── layout.tsx     # Main layout with navigation
│   │   ├── feed/          # Feed page
│   │   └── profile/       # Profile pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (redirects)
│   ├── loading.tsx        # Global loading UI
│   ├── error.tsx          # Global error UI
│   ├── not-found.tsx      # 404 page
│   ├── providers.tsx      # React Query provider
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # Shadcn/UI components
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   ├── auth.ts          # Server-side auth
│   ├── socket.ts        # Socket.io client
│   ├── store.ts         # Zustand store
│   └── utils.ts         # Utility functions
├── middleware.ts         # Next.js middleware
└── public/              # Static assets
```

## Features

- **App Router**: Next.js 14+ App Router with route groups
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Beautiful, accessible components
- **React Query**: Server state management
- **Zustand**: Client state management
- **Authentication**: JWT with HttpOnly cookies
- **Route Protection**: Middleware-based auth

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:5000`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Route Groups

### `(auth)` - Authentication Routes
- `/login` - Login page
- `/register` - Registration page
- Shared layout for auth pages

### `(main)` - Main Application Routes
- `/feed` - Posts feed
- `/profile/[id]` - User profiles
- Shared layout with navigation

## Pages

### Home (`/`)
Redirects to `/feed` if authenticated, otherwise `/login`.

### Login (`/login`)
User login form with email and password.

### Register (`/register`)
User registration form with username, email, and password.

### Feed (`/feed`)
Main feed showing all posts with pagination.

### Profile (`/profile/[id]`)
User profile page with posts, followers, and following counts.

## Components

### UI Components (Shadcn/UI)
- `Button` - Button component
- `Card` - Card container
- `Input` - Input field

## State Management

### React Query
Used for server state (API data):
- Posts
- User profiles
- Follow status

### Zustand
Used for client state:
- Authentication state
- User information

## API Integration

All API calls go through `lib/api.ts` which:
- Handles authentication cookies
- Provides error handling
- Sets proper headers

## Authentication Flow

1. User logs in via `/login`
2. Backend sets HttpOnly cookie with JWT
3. Middleware checks cookie for protected routes
4. API client automatically includes cookie in requests
5. User state stored in Zustand

## Middleware

The `middleware.ts` file handles:
- Redirecting authenticated users away from auth pages
- Redirecting unauthenticated users to login
- Route protection

## Styling

- **Tailwind CSS**: Utility classes
- **Shadcn/UI**: Component library
- **CSS Variables**: For theming
- **Responsive**: Mobile-first design

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Structure

- **Pages**: Use App Router file-based routing
- **Components**: Reusable UI components
- **Lib**: Utilities and helpers
- **Types**: TypeScript type definitions

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL

## Next Steps

- Add more UI components
- Implement post creation
- Add real-time features
- Enhance error handling
- Add loading states
- Implement infinite scroll

