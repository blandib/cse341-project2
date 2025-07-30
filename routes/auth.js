import { Router } from 'express';
import { getDb, hashPassword, comparePassword } from '../app.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/register', async (req, res) => {
  try {
    const db = getDb();
    const { username, password } = req.body;
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }
    
    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    await db.collection('users').insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date()
    });
    
    res.status(201).send('User created');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    const db = getDb();
    const { username, password } = req.body;
    
    // Find user
    const user = await db.collection('users').findOne({ username });
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }
    
    // Compare passwords
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).send('Invalid credentials');
    }
    
    // Create session
    req.session.userId = user._id.toString();
    res.send('Logged in successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out current user
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Logout failed');
    res.clearCookie('connect.sid');
    res.send('Logged out successfully');
  });
});

export default router;