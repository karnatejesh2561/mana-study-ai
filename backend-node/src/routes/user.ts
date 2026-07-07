import { Router } from 'express';
import { getMe, updateMe } from '../controllers/userController';
import { supabaseAuth } from '../middleware/auth';

const router = Router();

router.get('/me', supabaseAuth, getMe);
// Accept PATCH, PUT and POST for environments that may not forward PATCH verbs.
router.patch('/me', supabaseAuth, updateMe);
router.put('/me', supabaseAuth, updateMe);
router.post('/me', supabaseAuth, updateMe);

export default router;
