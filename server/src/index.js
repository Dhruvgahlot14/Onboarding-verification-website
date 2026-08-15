import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import profileRoutes from './routes/profile.js';
import attendanceRoutes from './routes/attendance.js';
import leavesRoutes from './routes/leaves.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        origin.startsWith('http://localhost') ||
        origin.endsWith('vercel.app') ||
        origin === process.env.CLIENT_URL
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leavesRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
