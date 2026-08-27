import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { requestLogger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import feedRoutes from './routes/feed.routes';
import storyRoutes from './routes/story.routes';
import reelsRoutes from './routes/reels.routes';
import userRoutes from './routes/user.routes';
import followRoutes from './routes/follow.routes';
import groupRoutes from './routes/group.routes';
import moderationRoutes from './routes/moderation.routes';
import chatRoutes from './routes/chat.routes';
import notificationRoutes from './routes/notification.routes';
import searchRoutes from './routes/search.routes';
import adminRoutes from './routes/admin.routes';
import { socketAuthMiddleware } from './middlewares/socket.middleware';
import { initStoryCleanup } from './cron/storyCleanup';
import { registerChatHandlers } from './sockets/chat.handler';


const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL, credentials: true }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/reels', reelsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Initialize Cron Jobs
initStoryCleanup();

// Socket.io
io.use(socketAuthMiddleware);
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id, 'User:', socket.data.user?.userId);
  
  socket.join(`user_${socket.data.user?.userId}`);
  
  registerChatHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 10000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
