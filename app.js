
import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import itemsRouter from './routes/items.js';
import categoriesRouter from './routes/categories.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
});

// Database connection
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('projectDB');
    console.log('✅ MongoDB connected');
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CSE341 Project API',
      version: '1.0.0',
      description: 'API for managing items and categories',
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
      }
    }
  },
  apis: ['./routes/*.js'], // Path to route files
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

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/categories', categoriesRouter);

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
  res.redirect('/api-docs'); // Redirect to Swagger UI
});

// Start server
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Swagger UI: http://localhost:${PORT}/api-docs`);
});