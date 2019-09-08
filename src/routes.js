import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/users', UserController.index);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/meetup', MeetupController.store);
routes.put('/meetup/:id', MeetupController.update);
routes.get('/meetup', MeetupController.index);
routes.delete('/meetup/:id', MeetupController.delete);

routes.post('/subscription/:meetupId', SubscriptionController.store);

export default routes;
