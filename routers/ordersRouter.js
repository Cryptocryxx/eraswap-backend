// routers/ordersRouter.js
import express from 'express';
import logMiddleware from './logMiddleware.js';
import ordersController from '../controllers/ordersController.js';

const router = express.Router();
router.use(logMiddleware);

// Create order from cart
router.post('/from-cart/:cartId', ordersController.createOrderFromCart);

// Get single order
router.get('/:orderId', ordersController.getOrder);

// List orders (optionally filter by ?userId=)
router.get('/', ordersController.listOrders);

export default router;
