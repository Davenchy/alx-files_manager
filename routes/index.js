import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

import { AuthGuard } from '../utils/middlewares';

const router = Router();

// check stats and status
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// users
router.post('/users', UsersController.postNew);
router.get('/users/me', AuthGuard, UsersController.getMe);

// auth
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthGuard, AuthController.getDisconnect);

export default router;
