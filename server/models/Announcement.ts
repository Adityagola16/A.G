import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  targetGroup: {
    type: String,
    enum: ['all', 'teachers', 'students', 'parents'],
    default: 'all'
  },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  author: String,
  important: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Announcement', AnnouncementSchema);
