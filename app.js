
import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import bcrypt from 'bcrypt';
import itemsRouter from './routes/items.js';
import categoriesRouter from './routes/categories.js';
import authRouter from './routes/auth.js';
import protectedRouter from './routes/protected.js';

dotenv.config();

// Get MongoDB URI from either MONGO_URI or MONGODB_URI
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

// Validate environment variables
const requiredEnvVars = ['DB_NAME', 'SESSION_SECRET'];
if (!mongoUri) requiredEnvVars.unshift('MONGO_URI/MONGODB_URI');

const missingVars = requiredEnvVars.filter(varName => {
  if (varName === 'MONGO_URI/MONGODB_URI') return !mongoUri;
  return !process.env[varName];
});

if (missingVars.length > 0) {
  console.error('FATAL: Missing required environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  
  // Provide debug info for Render
  if (process.env.RENDER) {
    console.log('\n===== Render Environment Variables =====');
    console.log(Object.keys(process.env).sort().join('\n'));
  }
  
  process.exit(1);
}

console.log('Environment variables validated successfully');
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`Using MongoDB URI: ${mongoUri.substring(0, 25)}... [masked]`);

const app = express();
const PORT = process.env.PORT || 8080;

// Create MongoDB client
const client = new MongoClient(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Database connection
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log('✅ MongoDB connected');
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

// Connect to database immediately
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`Incoming: ${req.method} ${req.url}`);
  next();
});

// Render production settings
if (process.env.RENDER) {
  console.log('Applying Render production settings');
  app.set('trust proxy', 1); // Trust first proxy
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: client,
    dbName: process.env.DB_NAME,
    collectionName: 'sessions',
    stringify: false,
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production' || process.env.RENDER,
    sameSite: process.env.RENDER ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CSE341 Project API',
      version: '1.0.0',
      description: 'E-commerce API with authentication',
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL 
              ? `https://cse341-project2-2pnh.onrender.com` 
              : `http://localhost:${PORT}`,
        description: process.env.RENDER_EXTERNAL_URL 
              ? 'Production server' 
              : 'Local development server'
      }
    ],
    components: {
      schemas: {
        Item: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        }
      },
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid'
        }
      }
    }
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Attach database to app
app.use(async (req, res, next) => {
  if (!db) {
    db = await connectDB();
  }
  req.db = db;
  next();
});

// Password helper functions
export async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Export database instance
export function getDb() {
  return db;
}

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/protected', protectedRouter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await req.db.command({ ping: 1 });
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: err.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});