import mongoose from 'mongoose';

const labSessionSchema = new mongoose.Schema({
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
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  sessionTitle: {
    type: String,
    trim: true,
  },
  attendance: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    present: {
      type: Boolean,
      default: false,
    },
  }],
  assignmentMarks: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
  }],
}, {
  timestamps: true,
});

const LabSession = mongoose.model('LabSession', labSessionSchema);
export default LabSession;
