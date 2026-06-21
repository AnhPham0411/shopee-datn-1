import { Router } from 'express';
import { getCategories } from '../controllers/category.controller';

const router = Router();

router.get('/categories', getCategories);

export default router;
