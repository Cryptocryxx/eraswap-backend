// routers/cartsRouter.js
import express from 'express';
import logMiddleware from './logMiddleware.js';
import cartsController from '../controllers/cartsController.js';

const router = express.Router();
router.use(logMiddleware);

// Create cart
router.post('/', cartsController.createCart);

// Cart operations
router.get('/:userid', cartsController.getCart);

// Get Total Price of Cart
router.get('/:userid/total-price', cartsController.getCartTotalPrice);

// Add item to cart
router.post('/:userid/items', cartsController.addItemToCart);

// Remove item from cart
router.delete('/:userid/items/:itemId', cartsController.removeItemFromCart);

// Clear cart
router.delete('/:userid', cartsController.clearCart);

export default router;
