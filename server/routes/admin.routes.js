import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import { upload } from '../utils/csvParser.js';
import {
  getDashboardStats,
  getTeachers, addTeacher, deleteTeacher, uploadTeachers,
  getStudents, addStudent, deleteStudent, uploadStudents,
  getAssignments, addAssignment, deleteAssignment, uploadAssignments,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require auth + admin role
router.use(verifyToken, requireRole('admin'));

router.get('/dashboard/stats', getDashboardStats);

router.get('/teachers', getTeachers);
router.post('/teachers', addTeacher);
router.delete('/teachers/:id', deleteTeacher);
router.post('/upload/teachers', upload.single('file'), uploadTeachers);

router.get('/students', getStudents);
router.post('/students', addStudent);
router.delete('/students/:id', deleteStudent);
router.post('/upload/students', upload.single('file'), uploadStudents);

router.get('/assignments', getAssignments);
router.post('/assignments', addAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.post('/upload/assignments', upload.single('file'), uploadAssignments);

export default router;
