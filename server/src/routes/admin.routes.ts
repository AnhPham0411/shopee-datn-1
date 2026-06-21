import { Router } from 'express';
import { getStats, getUsers, toggleLockUser, getProducts, deleteProduct, updateProduct, getStores, getAllOrders, updateOrderStatus, getCategories, createCategory, deleteCategory, updateCategory, adminGetVouchers, adminCreateVoucher, adminToggleVoucher, adminDeleteVoucher, adminGetReviews, adminDeleteReview } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['Admin']));

router.get('/stats', getStats);

// Users
router.get('/users', getUsers);
router.put('/users/:id/lock', toggleLockUser);

// Products
router.get('/products', getProducts);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Stores
router.get('/stores', getStores);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Vouchers
router.get('/vouchers', adminGetVouchers);
router.post('/vouchers', adminCreateVoucher);
router.put('/vouchers/:id/toggle', adminToggleVoucher);
router.delete('/vouchers/:id', adminDeleteVoucher);

// Reviews
router.get('/reviews', adminGetReviews);
router.delete('/reviews/:id', adminDeleteReview);

export default router;

