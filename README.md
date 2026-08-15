<div align="center">

# 🪐 Orbit

### A Production-Grade Gender-Segregated Social Platform

*Where privacy is a first-class citizen — built from the ground up with a strict gender-barrier access model, Instagram-style visual feeds, Facebook-style social graphs, and real-time everything.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)

</div>

---

## 📖 Overview

**Orbit** is a full-stack social media platform that enforces a **strict gender-segregation access model** at every layer of the stack — from HTTP middleware to Prisma query extensions to Socket.io connection handlers. No cross-gender content ever leaks through any surface.

The platform blends the best of two worlds:
- 📸 **Instagram** — visual feeds, stories, reels, explore grid, carousels, reactions
- 👥 **Facebook** — social graph, friend requests, groups, rich profiles, group discovery

Built as a production-quality monorepo with a modern, type-safe tech stack across 8 iterative development phases.

---

## ✨ Feature Highlights

### 🔐 Authentication & Access Control
- **Google OAuth 2.0 only** — no passwords, no credential risk
- **HttpOnly secure JWT cookies** — XSS-resistant session management
- **Gender Barrier** — a centralized `requireSameGender` middleware + Prisma query extensions enforce gender-matching at every route and every database query; mismatched-gender content never reaches the response payload
- **Block system** — fully bidirectional; blocks propagate through middleware and socket events independently of the gender rule

### 📰 Feed & Content
- **Post types**: text, image, carousel (multi-image), video, reels (short-form vertical video)
- **Home feed** — cursor-based infinite scroll, ranked by recency + weighted engagement score (likes × 1.5 + comments)
- **Explore grid** — trending public same-gender posts, Instagram-style
- **6-reaction system** — Like, Love, Haha, Wow, Sad, Angry; toggle-off on repeat; aggregate counts with every post
- **Nested comments** — one level of threaded replies; `GET /posts/:id/comments`
- **Save/unsave** — personal saved posts collection at `GET /saved`
- **Hashtags** — auto-parsed on creation; dedicated feed at `GET /hashtag/:tag`

### 📖 Stories & Reels
- **Stories**: 24-hour TTL, image/video, view tracking, grouped by user in a stories tray
- **Auto-expiry**: scheduled cron job purges expired stories
- **Reels**: dedicated vertical-scroll feed with snap-scroll and autoplay-on-view
- **Frontend**: circular avatar tray, full-screen viewer with progress bars and tap-to-advance

### 👤 Social Graph
- **Follow / Friend Request flow** — public accounts = instant follow; private accounts = follow-request requiring acceptance
- **Full profile page** — cover photo, avatar, bio, post grid, follower/friends count (all gender-filtered)
- **Edit profile** — all fields editable except gender (immutable after onboarding)
- **Groups** — gender-locked at creation; create/join/leave public or private groups; member/admin roles; gender-filtered discovery page
- **Block & Report** — `POST /block/:id`, `POST /report`; admin review queue endpoint

### 💬 Real-Time Chat & Notifications
- **Socket.io** — 1:1 and group conversations; gender barrier and block list enforced at connection level
- **Message features**: text, image attachments, read receipts, typing indicators, online/last-seen presence
- **Notifications** — generated on follow/like/comment/message/group-invite; real-time push via socket; REST history endpoint with mark-as-read
- **Frontend** — Messenger-style chat UI (conversation list + thread pane), notification bell with unread badge, toast for incoming events

### 🔍 Search & Moderation
- **Unified search** — users, hashtags, groups — all gender-filtered, debounced with categorized results dropdown
- **Content moderation** — profanity/spam filter runs on every post and comment before persistence
- **Rate limiting** — granular per-route limiters (posting, commenting, messaging, search)
- **Admin dashboard** — role-gated (`ADMIN` only); review reported content/users, suspend/ban accounts, platform analytics (DAU, post volume, signups by day)

### 🏗️ Production Hardening
- **Zod validation** on every API route's input
- **Consistent error shape** across all endpoints: `{ success, message, error }`
- **CORS lockdown** — origin whitelist enforced in production
- **Helmet.js** — security headers on every response
- **Input sanitisation** before database writes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/UI |
| **State** | TanStack React Query (server state), Zustand (client state) |
| **Backend** | Node.js, Express, TypeScript |
| **Real-time** | Socket.io |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma (with custom query extensions for gender filtering) |
| **Cache / Rate Limit** | Redis |
| **Auth** | Google OAuth 2.0 + JWT (HttpOnly cookies) |
| **Storage** | S3-compatible object storage (MinIO for local dev) |
| **Validation** | Zod |
| **Security** | Helmet, express-rate-limit, CORS |
| **Monorepo** | npm workspaces |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                     │
│            Next.js 14 App Router  ·  React Query            │
│            Zustand  ·  Shadcn/UI  ·  Tailwind CSS           │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTPS + WSS
┌────────────────────────▼────────────────────────────────────┐
│                    Express API Server                        │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Auth Layer │  │ Gender Barrier│  │  Rate Limiters    │  │
│  │  (JWT/OAuth)│  │  Middleware  │  │  (express-r-l)    │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Controllers                        │   │
│  │  auth · feed · post · story · reel · follow ·       │   │
│  │  group · chat · notification · search · admin        │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │         Prisma ORM (+ Gender Query Extensions)       │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
│  ┌──────────┐   ┌───────▼────────┐   ┌──────────────────┐  │
│  │  Redis   │   │  PostgreSQL 16 │   │  S3 / MinIO      │  │
│  │  (cache) │   │  (primary DB)  │   │  (media storage) │  │
│  └──────────┘   └────────────────┘   └──────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Socket.io Server (real-time layer)          │   │
│  │  · Gender + Block filter at connection handshake     │   │
│  │  · Chat rooms · Presence · Notifications             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Gender Barrier — How It Works

The gender-segregation rule is enforced at **three independent layers** so no single bypass can leak cross-gender content:

1. **HTTP Middleware** (`requireSameGender`) — looks up the target resource owner's gender from the database and calls `verifyGenderAccess(requesterGender, targetGender)`; throws a `403 ForbiddenError` on mismatch. Attached to every route that exposes cross-user data.

2. **Prisma Query Extensions** (`findManySameGender`) — every feed, search, explore, and group-discovery query passes a `gender` filter in the `WHERE` clause at the ORM level. Mismatched content is never fetched.

3. **Socket.io Handshake** — on connection, the authenticated user's gender and block list are read; room-join and message-emit handlers reject any cross-gender or blocked target before the event is processed.

---

## 📁 Project Structure

```
orbit/
├── apps/
│   ├── api/                        # Express backend
│   │   └── src/
│   │       ├── controllers/        # Route handlers (13 controllers)
│   │       ├── middlewares/        # auth, gender, validate, admin, logger
│   │       ├── routes/             # Express routers
│   │       ├── services/           # Business logic (gender, auth, feed)
│   │       ├── sockets/            # Socket.io event handlers
│   │       ├── cron/               # Scheduled jobs (story expiry)
│   │       └── utils/              # errors, validation, moderation
│   │
│   └── web/                        # Next.js 14 frontend
│       └── src/
│           ├── app/                # App Router pages
│           │   ├── feed/           # Home feed
│           │   ├── explore/        # Explore grid
│           │   ├── reels/          # Vertical reels feed
│           │   ├── profile/        # User profile
│           │   ├── groups/         # Groups discovery & detail
│           │   ├── messages/       # Chat UI
│           │   ├── admin/          # Admin dashboard
│           │   ├── login/          # Google OAuth login
│           │   └── onboarding/     # Gender & profile setup
│           └── components/         # Reusable UI components
│
├── packages/
│   ├── prisma/                     # Shared Prisma schema & client
│   │   └── schema.prisma           # Full data model (all models)
│   └── shared-types/               # TypeScript interfaces shared across apps
│
├── docker-compose.yml              # Postgres + Redis local infra
├── .env.example                    # Environment variable template
├── package.json                    # Monorepo workspace root
└── README.md
```

---

## 🗄️ Data Model (Key Models)

```
User          — id, email, name, gender, role, avatar, bio, isPrivate
Post          — id, authorId, mediaType (TEXT|IMAGE|CAROUSEL|VIDEO|REEL)
              — content, mediaUrls, feeling, location, visibility, hashtags
Story         — id, authorId, mediaUrl, mediaType, expiresAt (24hr TTL)
Follow        — followerId, followingId, status (PENDING|ACCEPTED)
Group         — id, name, gender (MALE|FEMALE), isPrivate, members[]
Conversation  — id, participants[], isGroup
Message       — id, conversationId, senderId, content, mediaUrl, readBy[]
Notification  — id, userId, type, referenceId, read
Reaction      — postId, userId, type (LIKE|LOVE|HAHA|WOW|SAD|ANGRY)
Comment       — id, postId, authorId, content, parentId (for replies)
Report        — id, reporterId, targetId, targetType, reason, status
Block         — blockerId, blockedId
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Docker & Docker Compose** (for local Postgres & Redis)
- **Google Cloud Console** project with OAuth 2.0 credentials

### 1. Clone the Repository

```bash
git clone https://github.com/forhad-fhj/Orbit.git
cd Orbit
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/socialplatform?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Google OAuth — from console.cloud.google.com
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# JWT
JWT_SECRET="a-long-random-secret-string"

# S3 / MinIO (local dev defaults)
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET_NAME="socialplatform-storage"
```

### 3. Start Infrastructure

```bash
docker-compose up -d
```

This starts **PostgreSQL** on port `5432` and **Redis** on port `6379`.

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up the Database

```bash
# Push the Prisma schema to your database
npm run db:push

# Generate the Prisma client
npm run db:generate
```

### 6. Start Development Servers

```bash
npm run dev
```

| Service | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:5001 |
| **Prisma Studio** | `npx prisma studio` (in `packages/prisma`) |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/google` | Redirect to Google OAuth |
| `GET` | `/auth/google/callback` | OAuth callback, issues JWT cookie |
| `POST` | `/auth/logout` | Clear session cookie |
| `GET` | `/auth/me` | Get current authenticated user |

### Posts & Feed
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/posts` | Create post (text/image/carousel/video) |
| `GET` | `/feed` | Paginated home feed (same-gender, cursor-based) |
| `GET` | `/explore` | Trending same-gender public posts |
| `POST` | `/posts/:id/react` | React to a post (toggle on repeat) |
| `GET` | `/posts/:id/comments` | Fetch comments with nested replies |
| `POST` | `/posts/:id/comments` | Add comment or reply |
| `POST` | `/posts/:id/save` | Save / unsave a post |
| `GET` | `/saved` | Get saved posts |
| `GET` | `/hashtag/:tag` | Posts by hashtag |

### Stories & Reels
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/stories` | Upload a story (24hr TTL) |
| `GET` | `/stories/feed` | Active stories from followed users |
| `POST` | `/stories/:id/view` | Mark a story as viewed |
| `GET` | `/reels` | Vertical reels feed (paginated) |

### Social Graph
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/follow/:id` | Follow or send friend request |
| `POST` | `/follow/:id/accept` | Accept pending follow request |
| `DELETE` | `/follow/:id` | Unfollow / reject request |
| `GET` | `/users/:id` | View a user profile (gender-gated) |
| `PATCH` | `/users/me` | Edit own profile |

### Groups
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/groups` | Create a group (gender-locked) |
| `GET` | `/groups` | Discover same-gender groups |
| `GET` | `/groups/:id` | Group detail + feed |
| `POST` | `/groups/:id/join` | Join a group |
| `DELETE` | `/groups/:id/leave` | Leave a group |

### Messaging & Notifications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/conversations` | List conversations |
| `POST` | `/conversations` | Start a conversation |
| `GET` | `/conversations/:id/messages` | Fetch message history |
| `GET` | `/notifications` | Notification history |
| `PATCH` | `/notifications/read` | Mark notifications as read |

### Search
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/search?q=&type=` | Unified search (users/hashtags/groups) |

### Admin (ADMIN role required)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/reports` | Review reported content |
| `POST` | `/admin/users/:id/suspend` | Suspend a user |
| `GET` | `/admin/analytics` | DAU, post volume, signups |

---

## 🔌 Real-Time Events (Socket.io)

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `join_conversation` | `{ conversationId }` | Subscribe to a chat room |
| `send_message` | `{ conversationId, content, mediaUrl? }` | Send a message |
| `typing` | `{ conversationId }` | Broadcast typing indicator |
| `stop_typing` | `{ conversationId }` | Stop typing indicator |

### Server → Client
| Event | Payload | Description |
|---|---|---|
| `new_message` | `Message` | Incoming message |
| `typing` | `{ userId, conversationId }` | User is typing |
| `user_online` | `{ userId }` | Presence update |
| `user_offline` | `{ userId, lastSeen }` | Presence update |
| `notification` | `Notification` | Real-time notification push |

---

## 🔒 Security Architecture

```
Request → Helmet (headers) → CORS check → Rate Limiter
       → requireAuth (JWT verify + block list load)
       → requireSameGender (gender DB lookup + verifyGenderAccess)
       → validate (Zod schema)
       → Controller
       → Prisma (findManySameGender extensions apply gender WHERE)
       → Response
```

- All cookie flags: `HttpOnly`, `Secure`, `SameSite=Strict`
- Rate limits: 10 posts/hour, 30 comments/hour, 60 messages/hour per user
- Zod schemas validate every request body and query parameter
- Profanity/spam filter runs before any post or comment is persisted

---

## 🧪 Testing

```bash
# Run gender barrier unit tests
cd apps/api
npx jest src/__tests__/gender.test.ts
```

The `gender.test.ts` suite covers `verifyGenderAccess` and `requireSameGender` edge cases.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all workspaces |
| `npm run db:push` | Push Prisma schema to DB (no migration file) |
| `npm run db:generate` | Regenerate Prisma client |

---

## 🗺️ Development Phases

This project was built iteratively across 8 phases:

| Phase | Focus |
|---|---|
| **0** | Monorepo scaffold, Prisma schema, Docker infra, shared types |
| **1** | Google OAuth 2.0, JWT sessions, onboarding (gender selection) |
| **2** | Gender Barrier — centralized middleware + Prisma query extensions |
| **3** | Core feed & posts — reactions, comments, saves, hashtags, infinite scroll |
| **4** | Stories (24hr TTL + cron) and Reels (vertical feed) |
| **5** | Social graph — follow/friend-request, full profiles, groups, block/report |
| **6** | Real-time chat & notifications via Socket.io |
| **7** | Unified search, admin dashboard, content moderation, rate limiting |
| **8** | Production hardening — Zod validation, CORS lockdown, security headers |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, etc.
4. Ensure TypeScript compiles: `tsc --noEmit`
5. Open a Pull Request against `main`

> **Critical Rule**: Any new route or Prisma query that exposes cross-user data **must** attach `requireSameGender` middleware and use `findManySameGender` extensions. PRs that break the gender barrier will not be merged.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

Built with ❤️ by [forhad-fhj](https://github.com/forhad-fhj)

</div>
