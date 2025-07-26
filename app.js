
/*const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

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

// Validation middleware
function validateName(req, res, next) {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ 
      error: 'Name is required and must be at least 2 characters' 
    });
  }
  
  req.body.name = name.trim();
  next();
}

// Items Routes
app.get('/api/items', async (req, res) => {
  try {
    const items = await db.collection('items').find().toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await db.collection('items').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

app.post('/api/items', validateName, async (req, res) => {
  try {
    const { name } = req.body;
    
    const result = await db.collection('items').insertOne({
      name,
      created_at: new Date()
    });
    
    res.status(201).json({ 
      _id: result.insertedId, 
      name 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.put('/api/items/:id', validateName, async (req, res) => {
  try {
    const { name } = req.body;
    
    const result = await db.collection('items').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const result = await db.collection('items').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

// Categories Routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.collection('categories').find().toArray();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const category = await db.collection('categories').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

app.post('/api/categories', validateName, async (req, res) => {
  try {
    const { name } = req.body;
    
    const result = await db.collection('categories').insertOne({
      name,
      created_at: new Date()
    });
    
    res.status(201).json({ 
      _id: result.insertedId, 
      name 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', validateName, async (req, res) => {
  try {
    const { name } = req.body;
    
    const result = await db.collection('categories').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category updated' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const result = await db.collection('categories').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.command({ ping: 1 });
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

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'API is running',
    endpoints: {
      items: '/api/items',
      categories: '/api/categories',
      health: '/health'
    }
  });
});

// Start server
async function startServer() {
  const database = await connectDB();
  app.locals.db = database;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`🔗 Items API: http://localhost:${PORT}/api/items`);
    console.log(`🔗 Categories API: http://localhost:${PORT}/api/categories`);
  });
}

startServer();
import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
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

/*
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
  res.json({
    message: 'API is running',
    endpoints: {
      items: {
        getAll: 'GET /api/items',
        getOne: 'GET /api/items/:id',
        create: 'POST /api/items',
        update: 'PUT /api/items/:id',
        delete: 'DELETE /api/items/:id'
      },
      categories: {
        getAll: 'GET /api/categories',
        getOne: 'GET /api/categories/:id',
        create: 'POST /api/categories',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id'
      },
      healthCheck: 'GET /health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});*/
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Swagger UI: http://localhost:${PORT}/api-docs`);
});