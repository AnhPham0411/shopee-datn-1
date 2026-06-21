import { Router } from 'express';
import { 
  registerStore, 
  getStoreProducts, 
  createStoreProduct, 
  updateStoreProduct, 
  deleteStoreProduct,
  getStoreOrders,
  getStoreDashboard
} from '../controllers/store.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/register', registerStore);

// Các endpoint dưới đây chỉ dành cho Store
router.use(requireRole(['Store', 'Admin']));

router.get('/products', getStoreProducts);
router.post('/products', createStoreProduct);
router.put('/products/:id', updateStoreProduct);
router.delete('/products/:id', deleteStoreProduct);

router.get('/orders', getStoreOrders);
router.get('/dashboard', getStoreDashboard);

export default router;
