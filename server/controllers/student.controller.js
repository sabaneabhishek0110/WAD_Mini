import User from '../models/User.model.js';
import TheoryRecord from '../models/TheoryRecord.model.js';
import LabSession from '../models/LabSession.model.js';
import Assignment from '../models/Assignment.model.js';
import MockTest from '../models/MockTest.model.js';

// GET /api/student/profile
export const getProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/student/theory/attendance
export const getTheoryAttendance = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    const records = await TheoryRecord.find({
      class: student.class,
      'attendance.0': { $exists: true },
    }).sort({ date: -1 });

    let totalClasses = 0;
    let present = 0;
    const attendanceList = [];

    records.forEach(record => {
      const studentAttendance = record.attendance.find(a => a.student.toString() === req.user.id);
      if (studentAttendance) {
        totalClasses++;
        if (studentAttendance.present) present++;
        attendanceList.push({
          date: record.date,
          subject: record.subject,
          present: studentAttendance.present,
        });
      }
    });

    const percentage = totalClasses > 0 ? ((present / totalClasses) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        attendance: attendanceList,
        totalClasses,
        present,
        percentage: Number(percentage),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/student/theory/unittests
export const getUnitTests = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    const records = await TheoryRecord.find({
      class: student.class,
      'unitTests.student': req.user.id,
    });

    const unitTests = [];
    records.forEach(record => {
      record.unitTests
        .filter(ut => ut.student.toString() === req.user.id)
        .forEach(ut => {
          // Check if testNo already exists to avoid duplicates
          const existing = unitTests.find(u => u.testNo === ut.testNo && record.subject === u.subject);
          if (!existing) {
            unitTests.push({
              testNo: ut.testNo,
              marksObtained: ut.marksObtained,
              maxMarks: ut.maxMarks,
              subject: record.subject,
            });
          }
        });
    });

    res.json({ success: true, data: unitTests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/student/lab/attendance
export const getLabAttendance = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    const sessions = await LabSession.find({
      batch: student.batch,
      'attendance.student': req.user.id,
    }).sort({ date: -1 });

    let totalSessions = 0;
    let present = 0;
    const attendanceList = [];

    sessions.forEach(session => {
      const studentAttendance = session.attendance.find(a => a.student.toString() === req.user.id);
      if (studentAttendance) {
        totalSessions++;
        if (studentAttendance.present) present++;
        attendanceList.push({
          date: session.date,
          sessionTitle: session.sessionTitle,
          subject: session.subject,
          batch: session.batch,
          present: studentAttendance.present,
        });
      }
    });

    const percentage = totalSessions > 0 ? ((present / totalSessions) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        attendance: attendanceList,
        totalSessions,
        present,
        percentage: Number(percentage),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/student/lab/marks
export const getLabMarks = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    const sessions = await LabSession.find({
      batch: student.batch,
      'assignmentMarks.student': req.user.id,
    }).populate('assignmentMarks.assignment', 'title assignmentNo subject maxMarks');

    const marksMap = {};
    sessions.forEach(session => {
      session.assignmentMarks
        .filter(am => am.student.toString() === req.user.id)
        .forEach(am => {
          if (am.assignment) {
            const key = am.assignment._id.toString();
            marksMap[key] = {
              assignmentId: am.assignment._id,
              assignmentNo: am.assignment.assignmentNo,
              title: am.assignment.title,
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

// GET /api/student/lab/mocktests
export const getMockTestResults = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    const mockTests = await MockTest.find({
      batch: student.batch,
      'studentMarks.student': req.user.id,
    }).sort({ date: -1 });

    const results = mockTests.map(mt => {
      const myMarks = mt.studentMarks.find(sm => sm.student.toString() === req.user.id);
      return {
        mockTestId: mt._id,
        title: mt.title,
        subject: mt.subject,
        date: mt.date,
        maxMarks: mt.maxMarks,
        marksObtained: myMarks?.marksObtained || 0,
      };
    });

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/student/dashboard/summary
export const getDashboardSummary = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    // Theory attendance
    const theoryRecords = await TheoryRecord.find({
      class: student.class,
      'attendance.student': req.user.id,
    });

    let theoryTotal = 0, theoryPresent = 0;
    theoryRecords.forEach(r => {
      const a = r.attendance.find(a => a.student.toString() === req.user.id);
      if (a) { theoryTotal++; if (a.present) theoryPresent++; }
    });

    // Lab attendance
    const labSessions = await LabSession.find({
      batch: student.batch,
      'attendance.student': req.user.id,
    });

    let labTotal = 0, labPresent = 0;
    labSessions.forEach(s => {
      const a = s.attendance.find(a => a.student.toString() === req.user.id);
      if (a) { labTotal++; if (a.present) labPresent++; }
    });

    // Unit test scores
    const utRecords = await TheoryRecord.find({
      class: student.class,
      'unitTests.student': req.user.id,
    });

    const unitTests = [];
    utRecords.forEach(r => {
      r.unitTests
        .filter(ut => ut.student.toString() === req.user.id)
        .forEach(ut => {
          const existing = unitTests.find(u => u.testNo === ut.testNo && u.subject === r.subject);
          if (!existing) {
            unitTests.push({
              testNo: ut.testNo,
              marksObtained: ut.marksObtained,
              maxMarks: ut.maxMarks,
              subject: r.subject,
            });
          }
        });
    });

    const avgUT = unitTests.length > 0
      ? (unitTests.reduce((sum, ut) => sum + ut.marksObtained, 0) / unitTests.length).toFixed(1)
      : 0;

    // Assignment marks
    const markSessions = await LabSession.find({
      batch: student.batch,
      'assignmentMarks.student': req.user.id,
    }).populate('assignmentMarks.assignment');

    let assignmentsAttempted = 0;
    const assignmentMarks = [];
    markSessions.forEach(s => {
      s.assignmentMarks
        .filter(am => am.student.toString() === req.user.id && am.assignment)
        .forEach(am => {
          assignmentsAttempted++;
          assignmentMarks.push({
            assignmentNo: am.assignment.assignmentNo,
            title: am.assignment.title,
            subject: am.assignment.subject,
            marksObtained: am.marksObtained,
            maxMarks: am.assignment.maxMarks,
          });
        });
    });

    // Mock test results
    const mockTests = await MockTest.find({
      batch: student.batch,
      'studentMarks.student': req.user.id,
    });

    const mockTestResults = mockTests.map(mt => {
      const myMarks = mt.studentMarks.find(sm => sm.student.toString() === req.user.id);
      return {
        title: mt.title,
        subject: mt.subject,
        marksObtained: myMarks?.marksObtained || 0,
        maxMarks: mt.maxMarks,
      };
    });

    // ==================== TERM WORK CALCULATION (per subject) ====================
    // Collect all unique subjects from assignments, UTs, theory attendance, and lab attendance
    const allSubjects = new Set();
    assignmentMarks.forEach(am => allSubjects.add(am.subject));
    unitTests.filter(ut => ut.subject && ut.subject !== 'Theory').forEach(ut => allSubjects.add(ut.subject));
    theoryRecords.forEach(r => { if (r.subject && r.subject !== 'Theory') allSubjects.add(r.subject); });
    labSessions.forEach(s => { if (s.subject) allSubjects.add(s.subject); });

    const termWork = [];
    allSubjects.forEach(subject => {
      // --- 1. Assignment component (60%) ---
      const subjectAssignments = assignmentMarks.filter(am => am.subject === subject);
      let assignmentPct = 0;
      if (subjectAssignments.length > 0) {
        const totalObtained = subjectAssignments.reduce((s, am) => s + am.marksObtained, 0);
        const totalMax = subjectAssignments.reduce((s, am) => s + am.maxMarks, 0);
        assignmentPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      }

      // --- 2. UT component (20%) ---
      const subjectUTs = unitTests.filter(ut => ut.subject === subject);
      let utPct = 0;
      if (subjectUTs.length > 0) {
        const utObtained = subjectUTs.reduce((s, ut) => s + ut.marksObtained, 0);
        const utMax = subjectUTs.reduce((s, ut) => s + ut.maxMarks, 0);
        utPct = utMax > 0 ? (utObtained / utMax) * 100 : 0;
      }

      // --- 3. Attendance component (20%) ---
      // Combine theory attendance for this subject + lab attendance for this subject
      let attPresent = 0, attTotal = 0;

      // Theory attendance for this subject
      theoryRecords.filter(r => r.subject === subject).forEach(r => {
        const a = r.attendance.find(a => a.student.toString() === req.user.id);
        if (a) { attTotal++; if (a.present) attPresent++; }
      });

      // Lab attendance for this subject
      labSessions.filter(s => s.subject === subject).forEach(s => {
        const a = s.attendance.find(a => a.student.toString() === req.user.id);
        if (a) { attTotal++; if (a.present) attPresent++; }
      });

      const attendancePct = attTotal > 0 ? (attPresent / attTotal) * 100 : 0;

      // --- Term Work formula: 60% assignments + 20% UT + 20% attendance ---
      const termWorkScore = (0.6 * assignmentPct) + (0.2 * utPct) + (0.2 * attendancePct);

      termWork.push({
        subject,
        assignmentPct: Number(assignmentPct.toFixed(1)),
        utPct: Number(utPct.toFixed(1)),
        attendancePct: Number(attendancePct.toFixed(1)),
        termWorkScore: Number(termWorkScore.toFixed(1)),
        assignmentCount: subjectAssignments.length,
        utCount: subjectUTs.length,
        attendanceCount: attTotal,
      });
    });

    // Sort by subject name
    termWork.sort((a, b) => a.subject.localeCompare(b.subject));

    res.json({
      success: true,
      data: {
        rollNumber: student.rollNumber || '',
        theoryAttendance: theoryTotal > 0 ? Number(((theoryPresent / theoryTotal) * 100).toFixed(1)) : 0,
        labAttendance: labTotal > 0 ? Number(((labPresent / labTotal) * 100).toFixed(1)) : 0,
        avgUnitTestScore: Number(avgUT),
        assignmentsAttempted,
        unitTests,
        assignmentMarks,
        mockTestResults,
        termWork,
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
