import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  assignmentNo: {
    type: Number,
    required: [true, 'Assignment number is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  maxMarks: {
    type: Number,
    default: 25,
  },
}, {
  timestamps: true,
});

assignmentSchema.index({ subject: 1, assignmentNo: 1 }, { unique: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
