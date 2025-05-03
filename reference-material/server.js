require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Create logs directory first
const createLogsDir = require('./utils/createLogsDir');
createLogsDir();

// Then initialize logger
const logger = require('./utils/logger')('Server');

const { setupCronJobs, gracefulJobShutdown } = require('./cron/cronJobs');
const { connectRedis, getRedisClient } = require('./config/redis');
const { connectDB } = require('./config/database');
const { configurePassport } = require('./config/passport');
const { swaggerSetup } = require('./config/swagger');
const { errorHandler, notFoundMiddleware } = require('./middleware/errorMiddleware');
const { getEnvironment, getAllConfig } = require('./config/env');
const { validateApiKey, blockSuspiciousRequests } = require('./middleware/apiKeyMiddleware');

// Import routes
const scheduleRoutes = require('./routes/scheduleRoutes');
const searchRoutes = require('./routes/searchRoutes');
const characterRoutes = require('./routes/characterRoutes');
const genreRoutes = require('./routes/genreRoutes');
const animeRoutes = require('./routes/animeRoutes');

// Import Phase 2 routes with consistent naming
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Import API key tester routes
const apiKeyTesterRoutes = require('./routes/apiKeyTester');

// Initialize Express app
const app = express();
const config = getAllConfig();
const PORT = config.port;
const env = getEnvironment();
const apiPrefix = config.apiPrefix;

// Log server startup
logger.info(`Starting OtakuList API in ${env} mode`);

// Trust proxy (important for rate limiter when behind a load balancer or proxy)
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true // Allow cookies to be sent with requests
  })
);
app.use(hpp());

// Block suspicious scanner requests
app.use(blockSuspiciousRequests);

// Configure rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // default: 15 minutes
  max: process.env.RATE_LIMIT || config.rateLimit || 100, // Regular limit
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip the rate limiter for development environment
  skip: (req) => {
    // Skip in development environment
    if (env === 'development') return true;
    return false;
  },
  // Custom key generator to properly identify clients behind proxy
  keyGenerator: (req) => {
    // Use X-Forwarded-For if present (when behind proxy) or fall back to IP
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.ip;
    return clientIP;
  }
});

// Apply rate limiting to all requests
app.use(limiter);

// Force trailing slash consistency to prevent 301 redirects
app.use((req, res, next) => {
  // Skip this middleware for Swagger docs paths
  if (req.path.startsWith('/api/v1/docs')) {
    return next();
  }
  
  if (req.path.slice(-1) === '/' && req.path.length > 1) {
    // Remove trailing slash
    const query = req.url.slice(req.path.length);
    const newPath = req.path.slice(0, -1) + query;
    return res.redirect(301, newPath);
  }
  next();
});

// Enhanced request timeout middleware with proper cleanup
app.use((req, res, next) => {
  // Get timeout value from config or use default
  // Use a shorter timeout for free tier
  const defaultTimeout = 30000;
  
  // Set a longer timeout for the Google OAuth callback route
  let timeout = parseInt(process.env.REQUEST_TIMEOUT_MS || defaultTimeout.toString());
  
  // Increase timeout for Google Auth callback specifically
  if (req.originalUrl && req.originalUrl.includes('/auth/google/callback')) {
    // Use a longer timeout (2 minutes) for Google OAuth callbacks
    timeout = parseInt(process.env.GOOGLE_CALLBACK_TIMEOUT_MS || '120000');
    logger.info(`Using extended timeout of ${timeout}ms for Google OAuth callback`);
  }
  
  // Create a timeout ID
  const timeoutId = setTimeout(() => {
    req.timedOut = true;
    logger.warn(`Request to ${req.originalUrl} timed out after ${timeout}ms`);
    
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        message: 'Gateway Timeout: The request took too long to process'
      });
    }
  }, timeout);
  
  // Clear the timeout when the response finishes
  res.on('finish', () => {
    clearTimeout(timeoutId);
  });
  
  // Clear the timeout if there's an error
  res.on('error', () => {
    clearTimeout(timeoutId);
  });
  
  next();
});

// Parse cookies
app.use(cookieParser());

// Parse JSON requests
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Compress responses
app.use(compression());

// Initialize Passport
app.use(passport.initialize());
configurePassport();

// Setup Swagger documentation
swaggerSetup(app);

// Health check endpoint - exempt from API key validation
app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  const health = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB',
    },
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  };
  
  // Check database connection
  if (mongoose.connection.readyState !== 1) {
    health.status = 'degraded';
  }
  
  res.json(health);
});

// Root route - redirect to API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'OtakuList API',
    version: '2.0',
    description: 'API for OtakuList Android application',
    documentation: `${req.protocol}://${req.get('host')}${apiPrefix}/docs`,
    status: 'online'
  });
});

// API key tester endpoint without key validation
app.use(`${apiPrefix}/test`, apiKeyTesterRoutes);

// Apply API key validation to all API routes
app.use(apiPrefix, validateApiKey);

// Register routes with prefix
app.use(`${apiPrefix}/schedule`, scheduleRoutes);
app.use(`${apiPrefix}/search`, searchRoutes);
app.use(`${apiPrefix}/characters`, characterRoutes);
app.use(`${apiPrefix}/genres`, genreRoutes);
app.use(`${apiPrefix}/anime`, animeRoutes);
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/playlists`, playlistRoutes);
app.use(`${apiPrefix}/watchlist`, watchlistRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);

logger.info(`API routes registered with prefix: ${apiPrefix}`);

// Not found middleware for undefined routes
app.use(notFoundMiddleware);

// Error handler middleware for all errors
app.use(errorHandler);

// Periodic garbage collection if available
if (global.gc) {
  logger.info('Garbage collection enabled');
  setInterval(() => {
    try {
      const before = process.memoryUsage().heapUsed / 1024 / 1024;
      global.gc();
      const after = process.memoryUsage().heapUsed / 1024 / 1024;
      logger.debug(`Garbage collection complete. Heap reduced from ${before.toFixed(2)} MB to ${after.toFixed(2)} MB`);
    } catch (err) {
      logger.error(`Garbage collection failed: ${err.message}`);
    }
  }, 30 * 60 * 1000); // Run every 30 minutes
}

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Cancel any pending Jikan API requests
    const jikanService = require('./services/jikanService');
    if (jikanService && typeof jikanService.cancelAllRequests === 'function') {
      logger.info('Cancelling pending Jikan API requests...');
      jikanService.cancelAllRequests();
    }
    
    // First, stop accepting new requests
    if (server) {
      await new Promise(resolve => {
        server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });
    }
    
    // Gracefully stop running cron jobs with strict timeout
    if (typeof gracefulJobShutdown === 'function') {
      logger.info('Waiting for cron jobs to complete...');
      await gracefulJobShutdown(10000); // Wait up to 10 seconds for jobs
    }
    
    // Wait for any remaining operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Close Redis connection if available
    try {
      const redisClient = getRedisClient();
      if (redisClient && typeof redisClient.quit === 'function') {
        await redisClient.quit();
        logger.info('Redis connection closed');
      }
    } catch (err) {
      logger.error(`Error closing Redis connection: ${err.message}`);
    }
    
    // Close database connection - using promises instead of callbacks
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed');
      } catch (err) {
        logger.error(`Error closing MongoDB connection: ${err.message}`);
      }
    }
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during graceful shutdown: ${error.message}`);
    process.exit(1);
  }
};

// Register signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Improve handling of unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(`Stack trace: ${err.stack}`);
  // Don't exit process - continue running but log the error
});

// Improve handling of uncaught exceptions - only exit if critical
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(`Stack trace: ${err.stack}`);
  
  // Only exit for critical errors
  if (isCriticalError(err)) {
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  }
});

// Helper to identify critical errors
function isCriticalError(err) {
  // Customize based on which errors should force restart
  const criticalErrors = [
    'EADDRINUSE', // Port in use
    'EACCES',     // Permission denied
    'ECONNREFUSED' // Connection refused
  ];
  
  return criticalErrors.some(code => err.code === code);
}

// Start the server
let server;
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the server
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      
      // Connect to Redis
      connectRedis();
      
      // Setup cron jobs
      setupCronJobs();
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;