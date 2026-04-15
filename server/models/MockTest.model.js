import mongoose from 'mongoose';

const mockTestSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  batch: {
    type: String,
    required: [true, 'Batch is required'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  maxMarks: {
    type: Number,
    default: 50,
  },
  studentMarks: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
  }],
}, {
  timestamps: true,
});

const MockTest = mongoose.model('MockTest', mockTestSchema);
export default MockTest;
