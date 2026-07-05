import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  department: String,
  schoolId: String,
  subjects: [String],
  classes: [String]
}, { timestamps: true });

export default mongoose.model('Teacher', TeacherSchema);
