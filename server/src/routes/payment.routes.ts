import { Router } from 'express';
import { confirmPayment } from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.post('/:orderId/confirm', confirmPayment);

export default router;
