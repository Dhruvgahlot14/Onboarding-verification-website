import express from 'express';
import { body, validationResult } from 'express-validator';
import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Helper function to calculate working days (excluding weekends)
const calculateWorkingDays = (startDate, endDate) => {
  let count = 0;
  let curDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (curDate <= end) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
};

// POST /api/leaves
// Submit a leave request
router.post(
  '/',
  [
    body('leaveType').isIn(['annual', 'sick', 'casual']).withMessage('Invalid leave type'),
    body('startDate').isISO8601().toDate(),
    body('endDate').isISO8601().toDate(),
    body('reason').notEmpty().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { leaveType, startDate, endDate, reason } = req.body;

      if (startDate > endDate) {
        return res.status(400).json({ message: 'Start date cannot be after end date' });
      }

      // Check for overlap with approved or pending leaves
      const overlap = await LeaveRequest.findOne({
        employeeId: req.user.id,
        status: { $in: ['pending', 'approved'] },
        $or: [
          { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
        ]
      });

      if (overlap) {
        return res.status(400).json({ message: 'Dates overlap with an existing leave request' });
      }

      // Calculate required days
      const daysRequested = calculateWorkingDays(startDate, endDate);
      if (daysRequested === 0) {
        return res.status(400).json({ message: 'Selected date range contains no working days' });
      }

      // Prevent exceeding balance on submission
      const balance = await LeaveBalance.findOne({ userId: req.user.id });
      if (!balance) {
        return res.status(400).json({ message: 'Leave balance not found' });
      }

      const available = balance[`${leaveType}Total`] - balance[`${leaveType}Used`];
      if (daysRequested > available) {
        return res.status(400).json({ 
          message: `Insufficient ${leaveType} leave balance. Requested: ${daysRequested}, Available: ${available}` 
        });
      }

      const newLeave = await LeaveRequest.create({
        employeeId: req.user.id,
        leaveType,
        startDate,
        endDate,
        reason,
        status: 'pending'
      });

      res.status(201).json({ message: 'Leave request submitted successfully', leave: newLeave });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/leaves/mine
// Get employee's own leave history and balance
router.get('/mine', async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    const balance = await LeaveBalance.findOne({ userId: req.user.id });
    
    res.json({ leaves, balance });
  } catch (error) {
    next(error);
  }
});

// GET /api/leaves/pending
// Manager only: fetch all pending leave requests for their department
router.get('/pending', authorize('manager', 'hr_admin'), async (req, res, next) => {
  try {
    let query = { status: 'pending' };

    // If manager, only show their department's employees
    if (req.user.role === 'manager') {
      const deptEmployees = await User.find({ department: req.user.department }).select('_id');
      const empIds = deptEmployees.map(e => e._id);
      query.employeeId = { $in: empIds };
    }

    const pendingLeaves = await LeaveRequest.find(query)
      .populate('employeeId', 'name email department')
      .sort({ createdAt: -1 });

    res.json({ count: pendingLeaves.length, leaves: pendingLeaves });
  } catch (error) {
    next(error);
  }
});

// GET /api/leaves/all
// HR Admin only: fetch all leave requests (optionally filtered by status)
router.get('/all', authorize('hr_admin'), async (req, res, next) => {
  try {
    let query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const leaves = await LeaveRequest.find(query)
      .populate('employeeId', 'name email department')
      .sort({ createdAt: -1 });

    res.json({ count: leaves.length, leaves });
  } catch (error) {
    next(error);
  }
});

// PUT /api/leaves/:id/status
// Manager/Admin approve or reject
router.put('/:id/status', authorize('manager', 'hr_admin'), async (req, res, next) => {
  try {
    const { status, managerComment } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Leave is already processed' });

    leave.status = status;
    leave.managerId = req.user.id;
    if (managerComment) leave.managerComment = managerComment;

    // Deduct balance on approval
    if (status === 'approved') {
      const daysRequested = calculateWorkingDays(leave.startDate, leave.endDate);
      const balance = await LeaveBalance.findOne({ userId: leave.employeeId });
      
      if (balance) {
        balance[`${leave.leaveType}Used`] += daysRequested;
        await balance.save();
      }
    }

    await leave.save();

    res.json({ message: `Leave request ${status} successfully`, leave });
  } catch (error) {
    next(error);
  }
});

export default router;
