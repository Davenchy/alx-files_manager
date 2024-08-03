import { Router } from 'express';
import { status, stats } from '../controllers/AppController';
import { postNew } from '../controllers/UsersController';

const router = Router();

// check stats and status
router.get('/status', status);
router.get('/stats', stats);

// users
router.post('/users', postNew);

export default router;
