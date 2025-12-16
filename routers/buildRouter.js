// routers/buildRouter.js
import express from 'express';
import path from 'path';
import logMiddleware from './logMiddleware.js';

const router = express.Router();
router.use(logMiddleware);

router.get('/windows', (req, res) => {
  const filePath = path.join(process.cwd(), 'uploads', "builds", 'EraSwapWindows.zip');
  res.download(filePath, 'EraSwapWindows.zip');
});

router.get('/mac', (req, res) => {
  const filePath = path.join(process.cwd(), 'uploads', "builds", 'EraSwap.zip');
  res.download(filePath, 'EraSwap.zip');
});

export default router;
