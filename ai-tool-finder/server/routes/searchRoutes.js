import { Router } from 'express';
import { searchTools } from '../controllers/searchController.js';

const router = Router();

router.get('/', searchTools);

export default router;
