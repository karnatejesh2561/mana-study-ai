import { Router } from 'express';
import { listPlans, createCheckoutSession } from '../controllers/subscriptionController';

const router = Router();

router.get('/plans', listPlans);
router.post('/create-session', createCheckoutSession);

export default router;
