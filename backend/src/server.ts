import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { initializeSocket } from './socket';
import { connectDatabase, checkDatabaseHealth, disconnectDatabase } from './lib/prisma';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import commentRoutes from './routes/comments';
import likeRoutes from './routes/likes';
import followRoutes from './routes/follows';
import messageRoutes from './routes/messages';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease create a .env file in the backend directory with these variables.');
  process.exit(1);
}

// Initialize Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware (development only)
if (NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  
  res.json({
    status: dbHealth ? 'ok' : 'degraded',
    message: 'Orbit API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: dbHealth ? 'connected' : 'disconnected',
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Orbit Social Media Platform API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Initialize Socket.io
initializeSocket(io);

// Start server with database connection
async function startServer() {
  // Connect to database
  const dbConnected = await connectDatabase();
  
  if (!dbConnected) {
    console.error('\n❌ Failed to connect to database. Please check your DATABASE_URL in .env file.\n');
    process.exit(1);
  }

  // Start HTTP server
  httpServer.listen(PORT, () => {
    console.log('\n🚀 Orbit Backend Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🗄️  Database: PostgreSQL (connected)`);
    console.log(`🔌 Socket.io initialized`);
    console.log(`📡 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} signal received: shutting down gracefully`);
  
  // Close HTTP server
  httpServer.close(async () => {
    console.log('HTTP server closed');
    
    // Disconnect from database
    await disconnectDatabase();
    
    console.log('Shutdown complete');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

