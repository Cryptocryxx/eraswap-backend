import express from 'express';
import logMiddleware from './logMiddleware.js';
import itemsController from '../controllers/itemsController.js';

const router = express.Router();
router.use(logMiddleware);

router.get('/', itemsController.getAllItems);
router.get('/:id', itemsController.getItemById);
router.post('/', itemsController.createItem);
router.put('/:id', itemsController.updateItem);
router.patch('/:id', itemsController.updateItem); // partial allowed too
router.delete('/:id', itemsController.deleteItem);
router.patch('/:id/stock', itemsController.adjustItemStock);

export default router;