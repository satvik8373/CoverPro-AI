import { Router } from 'express';
import {
  compareTools,
  createTool,
  getToolById,
  getTools,
  getTrendingTools,
  trackTimeSpent,
} from '../controllers/toolController.js';

const router = Router();

router.get('/', getTools);
router.get('/trending', getTrendingTools);
router.get('/:id', getToolById);
router.post('/', createTool);
router.post('/compare', compareTools);
router.post('/analytics/time-spent', trackTimeSpent);

export default router;
