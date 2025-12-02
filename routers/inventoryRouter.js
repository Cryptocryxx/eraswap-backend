// routers/inventoryRouter.js
import express from 'express';
import logMiddleware from './logMiddleware.js';
import inventoryController from '../controllers/inventoryController.js';

const router = express.Router();
router.use(logMiddleware);

// Get inventory
router.get('/:inventoryId', inventoryController.getInventory);

// Add item to inventory
router.post('/:inventoryId/items', inventoryController.addItemToInventory);

// Remove inventory item
router.delete('/:inventoryId/items/:itemId', inventoryController.removeInventoryItem);



export default router;
