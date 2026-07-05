import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: String,
  rollNo: String,
  date: { type: String, required: true }, // Format YYYY-MM-DD
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day', 'leave'],
    required: true
  },
  subject: String,
  markedBy: { type: String, required: true },
  method: {
    type: String,
    enum: ['manual', 'qr', 'face', 'gps', 'voice'],
    default: 'manual'
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  verified: { type: Boolean, default: true },
  notes: String,
  timing: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Attendance', AttendanceSchema);
