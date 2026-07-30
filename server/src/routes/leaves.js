import express from 'express';
import LeaveRequest from '../models/LeaveRequest.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// GET /api/leaves/pending
// Returns pending leave requests for the Manager and HR Dashboards to prevent 404s
// Uses the actual model but currently data won't exist until week 3
router.get('/pending', authorize('manager', 'hr_admin'), async (req, res, next) => {
  try {
    const pendingLeaves = await LeaveRequest.find({ status: 'pending' })
      .populate('employeeId', 'name email department')
      .sort({ createdAt: -1 });

    res.json({ count: pendingLeaves.length, leaves: pendingLeaves });
  } catch (error) {
    next(error);
  }
});

export default router;
