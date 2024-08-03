import { Router } from 'express';
import { getStatus, getStats } from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = Router();

// check stats and status
router.get('/status', getStatus);
router.get('/stats', getStats);

// users
router.post('/users', UsersController.postNew);

export default router;
