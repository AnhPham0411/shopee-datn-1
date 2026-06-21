import { Router } from 'express';
import { applyVoucher, createVoucher, getVouchers, getPublicVouchers } from '../controllers/voucher.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/public', getPublicVouchers);
router.post('/apply', applyVoucher);
router.post('/', requireRole(['Store', 'Admin']), createVoucher);
router.get('/', requireRole(['Store', 'Admin']), getVouchers);

export default router;
