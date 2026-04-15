import User from '../models/User.model.js';
import TheoryRecord from '../models/TheoryRecord.model.js';
import LabSession from '../models/LabSession.model.js';
import Assignment from '../models/Assignment.model.js';
import MockTest from '../models/MockTest.model.js';

// GET /api/teacher/profile
export const getProfile = async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id).select('-password');
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/teacher/classes
export const getClasses = async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id);
    res.json({ success: true, data: teacher.assignedClasses || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/teacher/batches
export const getBatches = async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id);
    res.json({ success: true, data: teacher.assignedBatches || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/teacher/class/:className/students
export const getClassStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', class: req.params.className })
      .select('-password')
      .sort({ rollNumber: 1, name: 1 });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/teacher/batch/:batchName/students
export const getBatchStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', batch: req.params.batchName })
      .select('-password')
      .sort({ rollNumber: 1, name: 1 });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/teacher/theory/attendance
export const saveTheoryAttendance = async (req, res) => {
  try {
    const { class: className, subject, date, attendance } = req.body;

    const record = new TheoryRecord({
      teacher: req.user.id,
      class: className,
      subject,
      date: new Date(date),
      attendance: attendance.map(a => ({
        student: a.studentId,
        present: a.present,
      })),
    });

    await record.save();
    res.status(201).json({ success: true, data: record, message: 'Attendance saved successfully' });
  } catch (error) {
    console.error('Save theory attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/teacher/theory/attendance/:className
export const getTheoryAttendance = async (req, res) => {
  try {
    const records = await TheoryRecord.find({
      teacher: req.user.id,
      class: req.params.className,
    })
      .populate('attendance.student', 'name email rollNumber')
      .sort({ date: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/teacher/theory/unittest
export const saveUnitTest = async (req, res) => {
  try {
    const { class: className, subject, testNo, marks } = req.body;

    // Find or create a theory record for unit tests
    let record = await TheoryRecord.findOne({
      teacher: req.user.id,
      class: className,
      subject,
    });

    if (!record) {
      record = new TheoryRecord({
        teacher: req.user.id,
        class: className,
        subject,
        date: new Date(),
        attendance: [],
        unitTests: [],
      });
    }

    // Remove existing marks for this test number, then add new ones
    record.unitTests = record.unitTests.filter(ut => ut.testNo !== Number(testNo));

    marks.forEach(m => {
      record.unitTests.push({
        testNo: Number(testNo),
        student: m.studentId,
        marksObtained: Number(m.marksObtained),
        maxMarks: Number(m.maxMarks) || 20,
      });
    });

    await record.save();
    res.json({ success: true, data: record, message: 'Unit test marks saved successfully' });
  } catch (error) {
    console.error('Save unit test error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/teacher/theory/unitTests/:className
export const getUnitTests = async (req, res) => {
  try {
    const records = await TheoryRecord.find({
      teacher: req.user.id,
      class: req.params.className,
      'unitTests.0': { $exists: true },
    })
      .populate('unitTests.student', 'name email rollNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/teacher/lab/session
export const createLabSession = async (req, res) => {
  try {
    const { batch, date, sessionTitle } = req.body;

    // Auto-populate subject from teacher's assignedBatches
    const teacher = await User.findById(req.user.id);
    const batchEntry = teacher.assignedBatches?.find(b => b.batch === batch);
    const subject = batchEntry?.subject || '';

    const session = new LabSession({
      teacher: req.user.id,
      batch,
      subject,
      date: new Date(date),
      sessionTitle,
    });
    await session.save();
    res.status(201).json({ success: true, data: session, message: 'Lab session created successfully' });
  } catch (error) {
    console.error('Create lab session error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/teacher/lab/sessions/:batchName
export const getLabSessions = async (req, res) => {
  try {
    const sessions = await LabSession.find({
      teacher: req.user.id,
      batch: req.params.batchName,
    })
      .populate('attendance.student', 'name email rollNumber')
      .populate('assignmentMarks.student', 'name email rollNumber')
      .populate('assignmentMarks.assignment', 'title assignmentNo subject maxMarks')
      .sort({ date: -1 });

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/teacher/lab/session/:sessionId/attendance
export const updateLabAttendance = async (req, res) => {
  try {
    const { attendance } = req.body;
    const session = await LabSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    session.attendance = attendance.map(a => ({
      student: a.studentId,
      present: a.present,
    }));

    await session.save();
    res.json({ success: true, data: session, message: 'Attendance updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/teacher/lab/session/:sessionId/marks
export const updateLabMarks = async (req, res) => {
  try {
    const { marks } = req.body;
    const session = await LabSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Merge marks
    marks.forEach(m => {
      const existing = session.assignmentMarks.find(
        am => am.student.toString() === m.studentId && am.assignment.toString() === m.assignmentId
      );
      if (existing) {
        existing.marksObtained = Number(m.marksObtained);
      } else {
        session.assignmentMarks.push({
          student: m.studentId,
          assignment: m.assignmentId,
          marksObtained: Number(m.marksObtained),
        });
      }
    });

    await session.save();
    res.json({ success: true, data: session, message: 'Marks updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/teacher/lab/batch/:batchName/marks — Save marks per batch+assignment (no session picker)
export const updateBatchMarks = async (req, res) => {
  try {
    const { batchName } = req.params;
    const { assignmentId, marks } = req.body;

    // Find the first session for this batch (or any session)
    let session = await LabSession.findOne({
      teacher: req.user.id,
      batch: batchName,
    }).sort({ date: -1 });

    if (!session) {
      // Auto-create a session if none exists
      const teacher = await User.findById(req.user.id);
      const batchEntry = teacher.assignedBatches?.find(b => b.batch === batchName);
      session = new LabSession({
        teacher: req.user.id,
        batch: batchName,
        subject: batchEntry?.subject || '',
        date: new Date(),
        sessionTitle: 'Auto-created session',
      });
      await session.save();
    }

    // Merge marks
    marks.forEach(m => {
      const existing = session.assignmentMarks.find(
        am => am.student.toString() === m.studentId && am.assignment?.toString() === assignmentId
      );
      if (existing) {
        existing.marksObtained = Number(m.marksObtained);
      } else {
        session.assignmentMarks.push({
          student: m.studentId,
          assignment: assignmentId,
          marksObtained: Number(m.marksObtained),
        });
      }
    });

    await session.save();

    // Re-fetch with populates to return full data
    const populated = await LabSession.findById(session._id)
      .populate('assignmentMarks.student', 'name email rollNumber')
      .populate('assignmentMarks.assignment', 'title assignmentNo subject maxMarks');

    res.json({ success: true, data: populated, message: 'Marks updated successfully' });
  } catch (error) {
    console.error('Update batch marks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/teacher/lab/batch/:batchName/marks — Retrieve all marks for a batch
export const getBatchMarks = async (req, res) => {
  try {
    const sessions = await LabSession.find({
      teacher: req.user.id,
      batch: req.params.batchName,
    })
      .populate('assignmentMarks.student', 'name email rollNumber')
      .populate('assignmentMarks.assignment', 'title assignmentNo subject maxMarks');

    // Flatten assignment marks from all sessions into a single map
    const marksMap = {}; // key: `studentId-assignmentId`
    sessions.forEach(session => {
      session.assignmentMarks.forEach(am => {
        if (am.student && am.assignment) {
          const key = `${am.student._id}-${am.assignment._id}`;
          marksMap[key] = {
            studentId: am.student._id,
            studentName: am.student.name,
            studentRollNumber: am.student.rollNumber,
            assignmentId: am.assignment._id,
            assignmentNo: am.assignment.assignmentNo,
            assignmentTitle: am.assignment.title,
            subject: am.assignment.subject,
            maxMarks: am.assignment.maxMarks,
            marksObtained: am.marksObtained,
          };
        }
      });
    });

    res.json({ success: true, data: Object.values(marksMap) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/teacher/assignments
export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ subject: 1, assignmentNo: 1 });
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== MOCK TEST ENDPOINTS =====================

// POST /api/teacher/lab/mocktest
export const createMockTest = async (req, res) => {
  try {
    const { batch, title, date, maxMarks } = req.body;

    // Auto-populate subject from teacher's assignedBatches
    const teacher = await User.findById(req.user.id);
    const batchEntry = teacher.assignedBatches?.find(b => b.batch === batch);
    const subject = batchEntry?.subject || '';

    const mockTest = new MockTest({
      teacher: req.user.id,
      batch,
      subject,
      title,
      date: new Date(date),
      maxMarks: maxMarks || 50,
    });

    await mockTest.save();
    res.status(201).json({ success: true, data: mockTest, message: 'Mock test created successfully' });
  } catch (error) {
    console.error('Create mock test error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/teacher/lab/mocktests/:batchName
export const getMockTests = async (req, res) => {
  try {
    const mockTests = await MockTest.find({
      teacher: req.user.id,
      batch: req.params.batchName,
    })
      .populate('studentMarks.student', 'name email rollNumber')
      .sort({ date: -1 });

    res.json({ success: true, data: mockTests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/teacher/lab/mocktest/:mockTestId/marks
export const updateMockTestMarks = async (req, res) => {
  try {
    const { marks } = req.body;
    const mockTest = await MockTest.findById(req.params.mockTestId);
    if (!mockTest) return res.status(404).json({ success: false, message: 'Mock test not found' });

    marks.forEach(m => {
      const existing = mockTest.studentMarks.find(
        sm => sm.student.toString() === m.studentId
      );
      if (existing) {
        existing.marksObtained = Number(m.marksObtained);
      } else {
        mockTest.studentMarks.push({
          student: m.studentId,
          marksObtained: Number(m.marksObtained),
        });
      }
    });

    await mockTest.save();

    const populated = await MockTest.findById(mockTest._id)
      .populate('studentMarks.student', 'name email rollNumber');

    res.json({ success: true, data: populated, message: 'Mock test marks updated successfully' });
  } catch (error) {
    console.error('Update mock test marks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
