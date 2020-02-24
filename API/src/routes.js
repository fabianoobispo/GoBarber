import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FilerController from './app/controllers/FileController';
import ProviderControllers from './app/controllers/ProviderControllers';
import AppnitmentControler from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/', (req, res) => res.send('ok')),
routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/providers', ProviderControllers.index);
routes.get('/providers/:providerId/available', AvailableController.index);

routes.post('/appointments', AppnitmentControler.store);
routes.get('/appointments', AppnitmentControler.index);
routes.delete('/appointments/:id', AppnitmentControler.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.post('/files', upload.single('file'), FilerController.store);

export default routes;
