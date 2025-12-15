// controllers/ordersController.js
import { Order, Cart, CartItem, Item, User } from '../models/index.js';
import { sequelize } from '../databases/sequelize.js';
import logger from '../logging/logger.js';

/**
 * POST /api/orders/from-cart/:cartId
 * Moves items from cart into newly created order.
 */
// verbose ordersController.createOrderFromCart — paste/replace and restart
export async function createOrderFromCart(req, res) {
  const t = await sequelize.transaction();
  try {
    const { cartId } = req.params;
    console.log('createOrderFromCart start - cartId=', cartId);

    // 1) load cart
    const cart = await Cart.findByPk(cartId, { transaction: t });
    console.log('Loaded cart:', cart ? cart.toJSON() : null);
    if (!cart) { await t.rollback(); console.log('Rollback - cart not found'); return res.status(404).json({ error: 'Cart not found' }); }

    // 2) load cart_items rows explicitly
    const cartItems = await CartItem.findAll({ where: { cart_id: cartId }, transaction: t });
    console.log('cartItems rows count =', cartItems.length, 'rows=', cartItems.map(ci => ci.toJSON()));
    if (!cartItems || cartItems.length === 0) { await t.rollback(); console.log('Rollback - cart empty'); return res.status(400).json({ error: 'Cart is empty' }); }

    // 3) load items
    const itemIds = cartItems.map(ci => ci.item_id);
    const items = await Item.findAll({ where: { id: itemIds }, transaction: t });
    console.log('Loaded items count =', items.length, 'ids=', itemIds);

    // sanity check: itemIds vs items found
    const foundIds = items.map(i => i.id);
    const missing = itemIds.filter(id => !foundIds.includes(id));
    if (missing.length > 0) {
      console.log('Missing item rows for ids:', missing);
      // decide: rollback & error
      await t.rollback();
      return res.status(500).json({ error: 'Some items referenced in cart_items do not exist', missing });
    }

    //Reduce Coins from User upon Order Creation
    const user = await User.findByPk(cart.user_id, { transaction: t });
    let totalPrice = 0;
    for (const it of items) {
      totalPrice += it.price;
    }
    console.log('Total price of order:', totalPrice, 'User coins available:', user.coins);
    if (user.coins < totalPrice) {
      console.log('Insufficient coins for user id=', user.id);
      await t.rollback();
      return res.status(400).json({ error: 'Insufficient coins to complete the order' });
    }
    // Deduct coins
    user.coins -= totalPrice;
    await user.save({ transaction: t });
    console.log('Deducted coins from user id=', user.id, 'new balance=', user.coins);

    // 4) create order
    let order;
    try {
      order = await Order.create({ user_id: cart.user_id }, { transaction: t });
      console.log('Order created id=', order.id);
    } catch (err) {
      console.error('Order.create FAILED:', err && err.message ? err.message : err);
      await t.rollback();
      return res.status(500).json({ error: 'Failed to create order', details: err && err.message });
    }

    // 5) move items -> update each item.order_id (and optionally remove reservation flags)
    for (const it of items) {
      try {
        console.log('Updating item id=', it.id, 'set order_id=', order.id);
        await it.update({ order_id: order.id }, { transaction: t });
      } catch (err) {
        console.error(`Failed to update item id=${it.id}:`, err && err.message ? err.message : err);
        // rollback and return detailed error
        await t.rollback();
        return res.status(500).json({ error: `Failed to attach item ${it.id} to order`, details: err && err.message });
      }
    }

    // 6) remove cart_items rows
    try {
      const del = await CartItem.destroy({ where: { cart_id: cartId }, transaction: t });
      console.log('Deleted cart_items rows:', del);
    } catch (err) {
      console.error('Failed to delete cart_items rows:', err && err.message ? err.message : err);
      await t.rollback();
      return res.status(500).json({ error: 'Failed to delete cart_items rows', details: err && err.message });
    }

    // 7) commit
    await t.commit();
    console.log('Transaction committed.');

    const fullOrder = await Order.findByPk(order.id, { include: [{ model: Item }, { model: User, attributes: ['id','username','email'] }] });

    return res.status(201).json(fullOrder);
  } catch (err) {
    // fallback catch
    try { await t.rollback(); } catch (e) { console.error('Rollback failed', e); }
    console.error('Create order fatal error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
}


export async function getOrder(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, { include: [{ model: Item }, { model: User, attributes: ['id','username','email'] }] });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    logger.error('Get order error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function getOrdersByUser(req, res) {
  try {
    const { userId } = req.params;
    const orders = await Order.findAll({ where: { user_id: userId }, include: [{ model: Item }], order: [['timestamp','DESC']] });
    res.status(200).json(orders);
  } catch (err) {
    logger.error('Get orders by user error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function listOrders(req, res) {
  try {
    const { userId } = req.query;
    const where = {};
    if (userId) where.user_id = userId;
    const orders = await Order.findAll({ where, include: [{ model: Item }], order: [['timestamp','DESC']] });
    res.status(200).json(orders);
  } catch (err) {
    logger.error('List orders error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function getItemsByUser(req, res) {
  try {
    const { userId } = req.params;
    const orders = await Order.findAll({ where: { user_id: userId }, include: [{ model: Item }], order: [['timestamp','DESC']] });
    const items = [];
    for (const order of orders) {
      for (const item of order.Items) {
        items.push(item);
      }
    }
    res.status(200).json(items);
  } catch (err) {
    logger.error('Get items by user error:', err);
    res.status(500).json({ error: err.message });
  }
}

export default {
  createOrderFromCart,
  getOrder,
  listOrders,
  getOrdersByUser,
  getItemsByUser
};
