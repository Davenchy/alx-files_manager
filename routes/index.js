import { Router } from 'express';
import { status, stats } from '../controllers/AppController';

const router = Router();

router.get('/status', status);
router.get('/stats', stats);

export default router;
