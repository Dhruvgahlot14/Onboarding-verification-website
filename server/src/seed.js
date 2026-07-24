import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDB from './config/db.js';
import User from './models/User.js';
import LeaveBalance from './models/LeaveBalance.js';

dotenv.config();

const seedUsers = [
  {
    name: 'Sarah Johnson',
    email: 'hr.admin@company.com',
    password: 'admin123',
    role: 'hr_admin',
    department: 'Human Resources',
    designation: 'HR Administrator',
  },
  {
    name: 'Michael Chen',
    email: 'manager@company.com',
    password: 'manager123',
    role: 'manager',
    department: 'Engineering',
    designation: 'Engineering Manager',
  },
  {
    name: 'Emily Davis',
    email: 'employee@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Developer',
  },
];

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await LeaveBalance.deleteMany({});

    console.log('Cleared existing users and leave balances');

    for (const userData of seedUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        department: userData.department,
        designation: userData.designation,
      });

      await LeaveBalance.create({ userId: user._id });
      console.log(`Created ${userData.role}: ${userData.email} (password: ${userData.password})`);
    }

    console.log('\nSeed completed successfully!');
    console.log('\nTest credentials:');
    seedUsers.forEach((u) => {
      console.log(`  ${u.role.padEnd(10)} → ${u.email} / ${u.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
