import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/order.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.post('/checkout', createOrder);
router.get('/', getOrders);
router.put('/:id/status', updateOrderStatus);

export default router;
