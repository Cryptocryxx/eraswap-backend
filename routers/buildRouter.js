// routers/buildRouter.js
import express from 'express';
import path from 'path';
import logMiddleware from './logMiddleware.js';
import sendEmail from '../logging/mail.js';
import buildController from '../controllers/buildController.js';

const router = express.Router();
router.use(logMiddleware);

router.get('/windows/:userid', (req, res) => {
  buildController.build('windows', req.params.userid);
});

router.get('/mac/:userid', (req, res) => {
  buildController.build('mac', req.params.userid);
});

export default router;
