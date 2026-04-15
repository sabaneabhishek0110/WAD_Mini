import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import {
  getProfile, getClasses, getBatches,
  getClassStudents, getBatchStudents,
  saveTheoryAttendance, getTheoryAttendance,
  saveUnitTest, getUnitTests,
  createLabSession, getLabSessions,
  updateLabAttendance, updateLabMarks,
  updateBatchMarks, getBatchMarks,
  getAssignments,
  createMockTest, getMockTests, updateMockTestMarks,
} from '../controllers/teacher.controller.js';

const router = Router();

router.use(verifyToken, requireRole('teacher'));

router.get('/profile', getProfile);
router.get('/classes', getClasses);
router.get('/batches', getBatches);
router.get('/class/:className/students', getClassStudents);
router.get('/batch/:batchName/students', getBatchStudents);

router.post('/theory/attendance', saveTheoryAttendance);
router.get('/theory/attendance/:className', getTheoryAttendance);
router.post('/theory/unittest', saveUnitTest);
router.get('/theory/unitTests/:className', getUnitTests);

router.post('/lab/session', createLabSession);
router.get('/lab/sessions/:batchName', getLabSessions);
router.put('/lab/session/:sessionId/attendance', updateLabAttendance);
router.put('/lab/session/:sessionId/marks', updateLabMarks);

// Batch-level marks (no session picker)
router.put('/lab/batch/:batchName/marks', updateBatchMarks);
router.get('/lab/batch/:batchName/marks', getBatchMarks);

// Mock tests
router.post('/lab/mocktest', createMockTest);
router.get('/lab/mocktests/:batchName', getMockTests);
router.put('/lab/mocktest/:mockTestId/marks', updateMockTestMarks);

router.get('/assignments', getAssignments);

export default router;
