import { Router } from 'express';
import { getStatus, getStats } from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const router = Router();

// check stats and status
router.get('/status', getStatus);
router.get('/stats', getStats);

// users
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// auth
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.disConnect);

export default router;
