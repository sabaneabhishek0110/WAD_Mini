import { Router } from 'express';
import { login, logout, refresh, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', verifyToken, getMe);

export default router;
