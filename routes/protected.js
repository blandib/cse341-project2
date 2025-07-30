import { Router } from 'express';
import { getDb } from '../app.js';
import { ObjectId } from 'mongodb';

const router = Router();

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).send('Unauthorized');
  next();
};

/**
 * @swagger
 * /api/protected/data:
 *   get:
 *     summary: Access protected content
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Protected data
 *       401:
 *         description: Unauthorized
 */
router.get('/data', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const userId = req.session.userId;
    
    // Get user from database
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(userId) 
    });
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    res.send(`Welcome ${user.username}! This is protected content.`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;