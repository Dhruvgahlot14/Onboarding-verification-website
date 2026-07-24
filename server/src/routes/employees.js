import express from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import LeaveBalance from '../models/LeaveBalance.js';
import { protect, authorize } from '../middleware/auth.js';
import { formatUserResponse } from '../utils/token.js';

const router = express.Router();

const employeeValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['employee', 'manager', 'hr_admin'])
    .withMessage('Invalid role'),
  body('department').optional().trim(),
  body('designation').optional().trim(),
];

// All employee routes require HR Admin
router.use(protect, authorize('hr_admin'));

// POST /api/employees — create a new employee
router.post('/', employeeValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, password, role, department, designation } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password || 'password123', 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'employee',
      department: department || '',
      designation: designation || '',
    });

    await LeaveBalance.create({ userId: user._id });

    res.status(201).json({
      message: 'Employee created successfully',
      employee: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/employees — list all active employees (supports ?search=)
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { isActive: true };

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { department: regex }, { designation: regex }];
    }

    const employees = await User.find(filter)
      .select('-passwordHash')
      .sort({ name: 1 });

    res.json({
      count: employees.length,
      employees: employees.map(formatUserResponse),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/employees/:id — get single employee profile
router.get('/:id', async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id).select('-passwordHash');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ employee: formatUserResponse(employee) });
  } catch (error) {
    next(error);
  }
});

// PUT /api/employees/:id — update employee details
router.put('/:id', employeeValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { name, email, role, department, designation, isActive, password } = req.body;

    if (email && email.toLowerCase() !== employee.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      employee.email = email;
    }

    if (name) employee.name = name;
    if (role) employee.role = role;
    if (department !== undefined) employee.department = department;
    if (designation !== undefined) employee.designation = designation;
    if (isActive !== undefined) employee.isActive = isActive;
    if (password) employee.passwordHash = await bcrypt.hash(password, 12);

    await employee.save();

    res.json({
      message: 'Employee updated successfully',
      employee: formatUserResponse(employee),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
