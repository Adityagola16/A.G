import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: String,
  grade: String,
  section: String,
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  appliedDate: { type: Date, default: Date.now },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherName: String,
  approvedBy: String
}, { timestamps: true });

export default mongoose.model('Leave', LeaveSchema);
