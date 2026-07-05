import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  grade: String,
  section: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  schoolId: String,
  streak: { type: Number, default: 0 },
  badges: [String],
  riskScore: { type: Number, default: 0 },
  attendanceGoal: { type: Number, default: 95 },
  subjects: [String]
}, { timestamps: true });

export default mongoose.model('Student', StudentSchema);
