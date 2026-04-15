import User from '../models/User.model.js';
import Assignment from '../models/Assignment.model.js';
import { parseCSV } from '../utils/csvParser.js';
import bcrypt from 'bcryptjs';

// GET /api/admin/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [totalTeachers, totalStudents, totalAssignments] = await Promise.all([
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      Assignment.countDocuments(),
    ]);

    // Get unique classes and batches
    const classes = await User.distinct('class', { role: 'student', class: { $ne: null, $ne: '' } });
    const batches = await User.distinct('batch', { role: 'student', batch: { $ne: null, $ne: '' } });

    res.json({
      success: true,
      data: {
        totalTeachers,
        totalStudents,
        totalClasses: classes.length,
        totalBatches: batches.length,
        totalAssignments,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/teachers
export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password').sort({ name: 1 });
    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/students
export const getStudents = async (req, res) => {
  try {
    const { class: className, batch } = req.query;
    const filter = { role: 'student' };
    if (className) filter.class = className;
    if (batch) filter.batch = batch;

    const students = await User.find(filter).select('-password').sort({ name: 1 });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/assignments
export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ subject: 1, assignmentNo: 1 });
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/admin/teachers
export const addTeacher = async (req, res) => {
  try {
    const { name, email, password, assignedClasses, assignedBatches } = req.body;
    const teacher = new User({
      name, email, password,
      role: 'teacher',
      assignedClasses: assignedClasses || [],
      assignedBatches: assignedBatches || [],
    });
    await teacher.save();
    const { password: _, ...teacherData } = teacher.toObject();
    res.status(201).json({ success: true, data: teacherData, message: 'Teacher added successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/students
export const addStudent = async (req, res) => {
  try {
    const { name, email, password, class: className, batch, rollNumber } = req.body;
    const student = new User({
      name, email, password,
      role: 'student',
      class: className,
      batch,
      rollNumber,
    });
    await student.save();
    const { password: _, ...studentData } = student.toObject();
    res.status(201).json({ success: true, data: studentData, message: 'Student added successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/assignments
export const addAssignment = async (req, res) => {
  try {
    const { subject, assignmentNo, title, maxMarks } = req.body;
    const assignment = new Assignment({ subject, assignmentNo, title, maxMarks });
    await assignment.save();
    res.status(201).json({ success: true, data: assignment, message: 'Assignment added successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Assignment already exists for this subject and number' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/teachers/:id
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findOneAndDelete({ _id: req.params.id, role: 'teacher' });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/students/:id
export const deleteStudent = async (req, res) => {
  try {
    const student = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/assignments/:id
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/admin/upload/teachers
export const uploadTeachers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'CSV file is required' });
    }

    const rows = await parseCSV(req.file.buffer);
    const teachers = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const assignedClasses = [];
        const assignedBatches = [];

        // Parse theory classes (up to 3)
        for (let j = 1; j <= 3; j++) {
          const cls = row[`theory_class_${j}`];
          const subj = row[`theory_subject_${j}`];
          if (cls && subj) {
            assignedClasses.push({ class: cls, subject: subj });
          }
        }

        // Parse lab batches (up to 4)
        for (let j = 1; j <= 4; j++) {
          const batch = row[`lab_batch_${j}`];
          const subj = row[`lab_subject_${j}`];
          if (batch && subj) {
            assignedBatches.push({ batch, subject: subj });
          }
        }

        if (!row.name || !row.email || !row.password) {
          errors.push({ row: i + 2, message: 'Missing required fields (name, email, password)' });
          continue;
        }

        const hashedPassword = await bcrypt.hash(row.password, 10);
        teachers.push({
          name: row.name,
          email: row.email.toLowerCase(),
          password: hashedPassword,
          role: 'teacher',
          assignedClasses,
          assignedBatches,
        });
      } catch (err) {
        errors.push({ row: i + 2, message: err.message });
      }
    }

    let inserted = 0;
    let skipped = 0;

    if (teachers.length > 0) {
      try {
        const result = await User.insertMany(teachers, { ordered: false });
        inserted = result.length;
      } catch (err) {
        if (err.insertedDocs) inserted = err.insertedDocs.length;
        if (err.writeErrors) {
          skipped = err.writeErrors.length;
          err.writeErrors.forEach(e => {
            errors.push({ row: 'bulk', message: e.errmsg });
          });
        }
      }
    }

    res.json({
      success: true,
      message: `Upload complete: ${inserted} inserted, ${skipped} skipped`,
      data: { inserted, skipped, errors },
    });
  } catch (error) {
    console.error('Upload teachers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/admin/upload/students
export const uploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'CSV file is required' });
    }

    const rows = await parseCSV(req.file.buffer);
    const students = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.name || !row.email || !row.password || !row.class || !row.batch) {
          errors.push({ row: i + 2, message: 'Missing required fields' });
          continue;
        }

        const hashedPassword = await bcrypt.hash(row.password, 10);
        students.push({
          name: row.name,
          email: row.email.toLowerCase(),
          password: hashedPassword,
          role: 'student',
          class: row.class,
          batch: row.batch,
          rollNumber: row.rollNumber || row.roll_number || '',
        });
      } catch (err) {
        errors.push({ row: i + 2, message: err.message });
      }
    }

    let inserted = 0;
    let skipped = 0;

    if (students.length > 0) {
      try {
        const result = await User.insertMany(students, { ordered: false });
        inserted = result.length;
      } catch (err) {
        if (err.insertedDocs) inserted = err.insertedDocs.length;
        if (err.writeErrors) {
          skipped = err.writeErrors.length;
        }
      }
    }

    res.json({
      success: true,
      message: `Upload complete: ${inserted} inserted, ${skipped} skipped`,
      data: { inserted, skipped, errors },
    });
  } catch (error) {
    console.error('Upload students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/admin/upload/assignments
export const uploadAssignments = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'CSV file is required' });
    }

    const rows = await parseCSV(req.file.buffer);
    const assignments = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.subject || !row.assignmentNo || !row.title) {
        errors.push({ row: i + 2, message: 'Missing required fields' });
        continue;
      }
      assignments.push({
        subject: row.subject,
        assignmentNo: Number(row.assignmentNo),
        title: row.title,
        maxMarks: Number(row.maxMarks) || 25,
      });
    }

    let inserted = 0;
    let skipped = 0;

    if (assignments.length > 0) {
      try {
        const result = await Assignment.insertMany(assignments, { ordered: false });
        inserted = result.length;
      } catch (err) {
        if (err.insertedDocs) inserted = err.insertedDocs.length;
        if (err.writeErrors) skipped = err.writeErrors.length;
      }
    }

    res.json({
      success: true,
      message: `Upload complete: ${inserted} inserted, ${skipped} skipped`,
      data: { inserted, skipped, errors },
    });
  } catch (error) {
    console.error('Upload assignments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
