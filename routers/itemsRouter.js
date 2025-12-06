import express from 'express';
import logMiddleware from './logMiddleware.js';
import itemsController from '../controllers/itemsController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
router.use(logMiddleware);

router.get('/', itemsController.getAllItems);
router.get('/:id', itemsController.getItemById);
router.get('/category/:category', itemsController.getItemsByCategory);

router.post('/', upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'pictures', maxCount: 6 }]), itemsController.createItem);

// update: same
router.put('/:id', upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'pictures', maxCount: 6 }]), itemsController.updateItem);
router.patch('/:id', upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'pictures', maxCount: 6 }]), itemsController.updateItem);


router.delete('/:id', itemsController.deleteItem);
router.patch('/:id/stock', itemsController.adjustItemStock);

export default router;