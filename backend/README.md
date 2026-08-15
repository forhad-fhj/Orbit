# Orbit Backend API

Express.js backend server for the Orbit social media platform.

## Features

- RESTful API with Express.js
- Real-time messaging with Socket.io
- JWT authentication with HttpOnly cookies
- PostgreSQL database with Prisma ORM
- TypeScript for type safety
- CORS enabled for frontend communication

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/orbit"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

3. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with hot reload (tsx watch)
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build first)

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

### Health Check
- `GET /api/health` - Server health status

## Socket.io Events

### Client → Server
- `authenticate` - Authenticate socket connection
- `send_message` - Send a message
- `typing` - Send typing indicator

### Server → Client
- `new_message` - Receive new message
- `message_sent` - Confirm message sent
- `user_typing` - Receive typing indicator
- `error` - Error occurred

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Prisma client instance
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication middleware
│   ├── routes/                # API route handlers
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── posts.ts
│   │   ├── comments.ts
│   │   ├── likes.ts
│   │   ├── follows.ts
│   │   └── messages.ts
│   ├── socket/                # Socket.io handlers
│   │   ├── index.ts
│   │   └── handlers.ts
│   └── server.ts              # Express server entry point
├── .env                       # Environment variables (create this)
├── package.json
└── tsconfig.json
```

