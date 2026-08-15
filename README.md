# Orbit - Social Platform

A production-grade social media platform that blends Facebook's social-graph/groups feel with Instagram's visual feed/stories feel, featuring a strict gender-segregation access model.

## Features
- **Gender-Segregated Access**: Content, feeds, and interactions are strictly partitioned by gender, ensuring a private and safe environment.
- **Google OAuth 2.0 Only**: Simplified, secure authentication with no passwords to manage.
- **Rich Content Feed**: Instagram-style posts, carousels, and reels with infinite scroll.
- **Real-Time Interactions**: Socket.io powered 1:1 and group chat, presence indicators (online/offline), and instant notifications.
- **Social Graph**: Facebook-style friends, followers, and groups.
- **Admin Dashboard & Moderation**: Role-based access, automated profanity/spam filtering, and user reporting.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/UI, React Query, Zustand.
- **Backend**: Node.js, Express, Socket.io for real-time features.
- **Database**: PostgreSQL with Prisma ORM.
- **Infrastructure**: Redis for rate limiting and caching.

## Project Structure
This is a monorepo utilizing npm workspaces:
- `apps/web`: Next.js frontend application
- `apps/api`: Express backend application
- `packages/prisma`: Shared Prisma schema and generated database client
- `packages/shared-types`: Shared TypeScript interfaces between frontend and backend

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Docker & Docker Compose (for local Postgres & Redis)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/forhad-fhj/Orbit.git
   cd Orbit
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` in the root directory.
   ```bash
   cp .env.example .env
   ```
   *Make sure to configure your Google OAuth Client ID & Secret in the `.env` file.*

3. **Start Infrastructure (Postgres + Redis):**
   ```bash
   docker-compose up -d
   ```

4. **Install Dependencies:**
   ```bash
   npm install
   ```

5. **Setup Database:**
   ```bash
   npm run db:push
   npm run db:generate
   ```

6. **Start Development Servers:**
   ```bash
   npm run dev
   ```
   - Frontend will run on `http://localhost:3000`
   - Backend will run on `http://localhost:5001`

## GitHub Guidelines (For Maintainers)
- **Branching Strategy**: Use `main` for production-ready code. Create feature branches (`feature/your-feature`) for development.
- **Commit Messages**: Write clear, descriptive commit messages. 
- **Pull Requests**: Ensure all PRs pass TypeScript and ESLint checks before merging.
- **Code Quality**: Ensure the gender barrier remains intact when adding new features or Prisma extensions.

## License
MIT License
