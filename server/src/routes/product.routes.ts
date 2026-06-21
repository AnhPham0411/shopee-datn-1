import { Router } from 'express';
import { getProducts, getProductById, getRecommendations, suggestProducts } from '../controllers/product.controller';
import { createReview, getReviews } from '../controllers/review.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/products', getProducts);
router.get('/products/recommendations', getRecommendations);
router.get('/products/suggest', suggestProducts);
router.get('/products/:id', getProductById);

router.post('/products/:id/reviews', requireAuth, createReview);
router.get('/products/:id/reviews', getReviews);

export default router;
