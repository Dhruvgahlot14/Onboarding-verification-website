import mongoose from 'mongoose';

const leaveBalanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    annualTotal: { type: Number, default: 20 },
    annualUsed: { type: Number, default: 0 },
    sickTotal: { type: Number, default: 10 },
    sickUsed: { type: Number, default: 0 },
    casualTotal: { type: Number, default: 5 },
    casualUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);

export default LeaveBalance;
