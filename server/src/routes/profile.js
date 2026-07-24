import express from 'express';
import { protect } from '../middleware/auth.js';
import { formatUserResponse } from '../utils/token.js';

const router = express.Router();

// GET /api/profile/me — logged-in user's own profile
router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({ employee: formatUserResponse(req.user) });
  } catch (error) {
    next(error);
  }
});

export default router;
