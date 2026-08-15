# Orbit - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies

From the root directory:

```bash
npm install
```

This will install dependencies for both backend and frontend workspaces.

### 2. Database Setup

1. Create a PostgreSQL database named `orbit` (or your preferred name)

2. Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/orbit"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

3. Generate Prisma Client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 3. Frontend Environment Setup

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Start Development Servers

From the root directory:

```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:5000`
- Frontend Next.js app on `http://localhost:3000`

Alternatively, you can run them separately:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Project Structure

```
orbit/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── lib/
│   │   │   └── prisma.ts      # Prisma client
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT authentication middleware
│   │   ├── routes/            # API routes
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── posts.ts
│   │   │   ├── comments.ts
│   │   │   ├── likes.ts
│   │   │   ├── follows.ts
│   │   │   └── messages.ts
│   │   ├── socket/            # Socket.io handlers
│   │   │   ├── index.ts
│   │   │   └── handlers.ts
│   │   └── server.ts          # Express server entry point
│   └── package.json
├── frontend/
│   ├── app/                   # Next.js App Router
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── feed/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   └── ui/                # Shadcn/UI components
│   ├── lib/
│   │   ├── api.ts            # API client
│   │   ├── auth.ts           # Server-side auth
│   │   ├── socket.ts         # Socket.io client
│   │   ├── store.ts          # Zustand store
│   │   └── utils.ts          # Utility functions
│   └── package.json
└── package.json              # Root workspace config
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/search/:query` - Search users

### Posts
- `GET /api/posts` - Get all posts (feed)
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/user/:userId` - Get user's posts

### Comments
- `GET /api/comments/post/:postId` - Get comments for post
- `POST /api/comments` - Create comment
- `DELETE /api/comments/:id` - Delete comment

### Likes
- `POST /api/likes/:postId` - Like a post
- `DELETE /api/likes/:postId` - Unlike a post
- `GET /api/likes/:postId/check` - Check if liked

### Follows
- `POST /api/follows/:userId` - Follow user
- `DELETE /api/follows/:userId` - Unfollow user
- `GET /api/follows/:userId/check` - Check if following
- `GET /api/follows/:userId/followers` - Get followers
- `GET /api/follows/:userId/following` - Get following

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message
- `PUT /api/messages/:userId/read` - Mark messages as read

## Socket.io Events

### Client → Server
- `authenticate` - Authenticate socket connection with JWT token
- `send_message` - Send a message
- `typing` - Send typing indicator

### Server → Client
- `new_message` - Receive new message
- `message_sent` - Confirm message sent
- `user_typing` - Receive typing indicator
- `error` - Error occurred

## Next Steps

1. **File Upload**: Implement file upload for images/videos (consider using AWS S3, Cloudinary, or local storage)
2. **Real-time Features**: Enhance Socket.io integration for notifications
3. **Pagination**: Add pagination to posts feed
4. **Search**: Implement advanced search functionality
5. **Notifications**: Add notification system
6. **Profile Pages**: Complete user profile pages
7. **Chat UI**: Build chat interface component
8. **Post Creation**: Add post creation form with media upload

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Ensure database exists

### Port Already in Use
- Change PORT in backend/.env
- Change Next.js port: `npm run dev:frontend -- -p 3001`

### Prisma Issues
- Run `npm run prisma:generate` after schema changes
- Run `npm run prisma:migrate` to apply migrations
- Use `npm run prisma:studio` to view database

