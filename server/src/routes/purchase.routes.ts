import { Router } from 'express';
import { addToCart, getCart, updateCart, deletePurchaseFromCart, buyProducts } from '../controllers/purchase.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/add-to-cart', addToCart);
router.get('/', getCart);
router.put('/update-purchase', updateCart);
router.delete('/', deletePurchaseFromCart);
router.post('/buy-products', buyProducts);

export default router;
