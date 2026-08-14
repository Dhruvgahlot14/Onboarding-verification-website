import express from 'express';
import { body, validationResult } from 'express-validator';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper to get start of day
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// All attendance routes require an authenticated user
router.use(protect);

// POST /api/attendance/checkin
router.post('/checkin', async (req, res, next) => {
  try {
    const today = getStartOfDay();

    // Check if an attendance record already exists for today
    const existing = await Attendance.findOne({ userId: req.user.id, date: today });
    if (existing && existing.checkIn) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }

    let attendance = existing;
    if (!attendance) {
      attendance = new Attendance({
        userId: req.user.id,
        date: today,
        checkIn: new Date(),
        status: 'present'
      });
    } else {
      attendance.checkIn = new Date();
      attendance.status = 'present';
    }

    await attendance.save();

    res.status(200).json({
      message: 'Checked in successfully',
      attendance
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/attendance/checkout
router.post('/checkout', async (req, res, next) => {
  try {
    const today = getStartOfDay();

    const attendance = await Attendance.findOne({ userId: req.user.id, date: today });
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'Not checked in yet today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out for today' });
    }

    const checkOutTime = new Date();
    attendance.checkOut = checkOutTime;
    
    // Calculate hours worked
    const diffMs = checkOutTime - attendance.checkIn;
    const hours = diffMs / (1000 * 60 * 60);
    attendance.hoursWorked = parseFloat(hours.toFixed(2));
    
    // Simple status logic: if hours < 4, half_day
    if (attendance.hoursWorked < 4) {
      attendance.status = 'half_day';
    } else {
      attendance.status = 'present';
    }

    await attendance.save();

    res.status(200).json({
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/attendance/mine
router.get('/mine', async (req, res, next) => {
  try {
    const { limit } = req.query;
    let query = Attendance.find({ userId: req.user.id }).sort({ date: -1 });
    
    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const history = await query;
    res.json({ attendance: history });
  } catch (error) {
    next(error);
  }
});

// GET /api/attendance/all — HR Admin only
router.get('/all', authorize('hr_admin'), async (req, res, next) => {
  try {
    const { date, allTime } = req.query;
    let filter = {};
    
    if (allTime !== 'true') {
      let queryDate = getStartOfDay();
      if (date) {
        queryDate = getStartOfDay(new Date(date));
      }
      filter.date = queryDate;
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate('userId', 'name email department role designation')
      .sort({ date: -1, createdAt: -1 });

    res.json({ attendance: attendanceRecords, date: filter.date });
  } catch (error) {
    next(error);
  }
});

export default router;
