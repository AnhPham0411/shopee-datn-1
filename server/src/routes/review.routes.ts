import { Router } from 'express';
import { createReview, getReviews } from '../controllers/review.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// GET /products/:id/reviews — public
router.get('/:id/reviews', getReviews);

// POST /products/:id/reviews — require auth
router.post('/:id/reviews', requireAuth, createReview);

export default router;
