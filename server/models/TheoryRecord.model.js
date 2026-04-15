import mongoose from 'mongoose';

const theoryRecordSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
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
  unitTests: [{
    testNo: {
      type: Number,
      min: 1,
      max: 3,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
    maxMarks: {
      type: Number,
      default: 20,
    },
  }],
}, {
  timestamps: true,
});

const TheoryRecord = mongoose.model('TheoryRecord', theoryRecordSchema);
export default TheoryRecord;
