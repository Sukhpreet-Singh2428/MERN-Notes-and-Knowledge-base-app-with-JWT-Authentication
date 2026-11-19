import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';

const router = Router();

// ── All Profile Endpoints Require JWT Authentication ────────────────────────
router.use(authenticateToken);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;
