import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema({
  grade: { type: String, required: true },
  section: { type: String, required: true },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  periods: [{
    subject: String,
    startTime: String, // e.g. "09:00"
    endTime: String,
    teacherName: String,
    room: String
  }]
}, { timestamps: true });

export default mongoose.model('Timetable', TimetableSchema);
