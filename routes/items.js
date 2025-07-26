/*import { Router } from 'express';
import { ObjectId } from 'mongodb';

const router = Router();

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

// GET all items
router.get('/', async (req, res) => {
  try {
    const items = await req.db.collection('items').find().toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET item by ID
router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const item = await req.db.collection('items').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new item
router.post('/', validateName, async (req, res) => {
  try {
    const { name } = req.body;
    
    const result = await req.db.collection('items').insertOne({
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

// PUT update item
router.put('/:id', validateName, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const { name } = req.body;
    
    const result = await req.db.collection('items').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const result = await req.db.collection('items').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
import { Router } from 'express';
import { ObjectId } from 'mongodb';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Item management
 *

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

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       500:
 *         description: Server error
 *
router.get('/', async (req, res) => {
  try {
    const items = await req.db.collection('items').find().toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
/*router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const item = await req.db.collection('items').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Item"
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 *
router.post('/', validateName, async (req, res) => {
  try {
    const { name } = req.body;
    
    const result = await req.db.collection('items').insertOne({
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

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Item"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Item updated
 *       400:
 *         description: Invalid ID or input
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 *
router.put('/:id', validateName, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const { name } = req.body;
    
    const result = await req.db.collection('items').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 *
router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const result = await req.db.collection('items').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;*/
import { Router } from 'express';
import { ObjectId } from 'mongodb';

const router = Router();

// Validation middleware
function validateName(req, res, next) {
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }
  
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ 
      error: 'Name is required and must be at least 2 characters' 
    });
  }
  
  req.body.name = name.trim();
  next();
}

/**
 * @swagger
 * tags:
 *   - name: Items
 *     description: Item management
 */

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const items = await req.db.collection('items').find().toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const item = await req.db.collection('items').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Item"
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', validateName, async (req, res) => {
  try {
    const { name } = req.body;
    
    const result = await req.db.collection('items').insertOne({
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

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Item"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Item updated
 *       400:
 *         description: Invalid ID or input
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateName, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const { name } = req.body;
    
    const result = await req.db.collection('items').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const result = await req.db.collection('items').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;