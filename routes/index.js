import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

import { AuthGuard, FileLoader } from '../utils/middlewares';

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

// files
router.get('/files', AuthGuard, FilesController.getIndex);
router.get('/files/:id', AuthGuard, FileLoader, FilesController.getShow);
router.get('/files/:id/data', AuthGuard, FileLoader, FilesController.getFile);
router.post('/files', AuthGuard, FilesController.postUpload);
router.put(
  '/files/:id/publish',
  AuthGuard,
  FileLoader,
  FilesController.putPublish,
);
router.put(
  '/files/:id/unpublish',
  AuthGuard,
  FileLoader,
  FilesController.putUnpublish,
);

export default router;
