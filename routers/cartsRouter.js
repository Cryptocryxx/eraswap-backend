// routers/cartsRouter.js
import express from 'express';
import logMiddleware from './logMiddleware.js';
import cartsController from '../controllers/cartsController.js';

const router = express.Router();
router.use(logMiddleware);

// Create cart
router.post('/', cartsController.createCart);

// Cart operations
router.get('/:cartId', cartsController.getCart);

// Add item to cart
router.post('/:cartId/items', cartsController.addItemToCart);

// Remove item from cart
router.delete('/:cartId/items/:itemId', cartsController.removeItemFromCart);

// Clear cart
router.delete('/:cartId', cartsController.clearCart);

export default router;
