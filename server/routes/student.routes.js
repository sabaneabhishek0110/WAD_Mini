import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import {
  getProfile,
  getTheoryAttendance,
  getUnitTests,
  getLabAttendance,
  getLabMarks,
  getMockTestResults,
  getDashboardSummary,
} from '../controllers/student.controller.js';

const router = Router();

router.use(verifyToken, requireRole('student'));

router.get('/profile', getProfile);
router.get('/theory/attendance', getTheoryAttendance);
router.get('/theory/unittests', getUnitTests);
router.get('/lab/attendance', getLabAttendance);
router.get('/lab/marks', getLabMarks);
router.get('/lab/mocktests', getMockTestResults);
router.get('/dashboard/summary', getDashboardSummary);

export default router;
