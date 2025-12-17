// controllers/cartsController.js
import { Cart, CartItem, Item, User } from '../models/index.js';
import logger from '../logging/logger.js';
import { sequelize } from '../databases/sequelize.js';
import { get } from 'http';

/**
 * POST /api/carts
 * Body: { userId }
 */
export async function createCart(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const cart = await Cart.create({ user_id: userId });
    res.status(201).json(cart);
  } catch (err) {
    logger.error('Create cart error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/carts/:cartId
 * Include Items via the through join (no quantity field)
 */
export async function getCart(req, res) {
  try {
    const { userid } = req.params;
    const cart = await Cart.findOne({ where: { user_id: userid }, include: [{ model: Item }] });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.status(200).json(cart);
  } catch (err) {
    logger.error('Get cart by user error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/carts/:cartId/items
 * Body: { itemId }
 * Adds a link between cart and item (no quantity). If already present, returns 409.
 */
export async function addItemToCart(req, res) {
  const t = await sequelize.transaction();
  try {
    const { cartId } = req.params;
    const { itemId } = req.body;
    if (!itemId) { await t.rollback(); return res.status(400).json({ error: 'itemId required' }); }

    const cart = await Cart.findByPk(cartId, { transaction: t });
    if (!cart) { await t.rollback(); return res.status(404).json({ error: 'Cart not found' }); }

    const item = await Item.findByPk(itemId, { transaction: t });
    if (!item) { await t.rollback(); return res.status(404).json({ error: 'Item not found' }); }

    // create association row; unique constraint ensures no duplicates
    const [ci, created] = await CartItem.findOrCreate({
      where: { cart_id: cartId, item_id: itemId },
      defaults: { cart_id: cartId, item_id: itemId },
      transaction: t,
    });

    if (!created) {
      await t.rollback();
      return res.status(409).json({ error: 'Item already in cart' });
    }

    await t.commit();
    const updated = await Cart.findByPk(cartId, { include: [{ model: Item }] });
    res.status(200).json(updated);
  } catch (err) {
    await t.rollback();
    logger.error('Add item to cart error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * DELETE /api/carts/:cartId/items/:itemId
 * Removes the cart_item row
 */
export async function removeItemFromCart(req, res) {
  try {
    const { cartId, itemId } = req.params;
    const ci = await CartItem.findOne({ where: { cart_id: cartId, item_id: itemId } });
    if (!ci) return res.status(404).json({ error: 'Cart item not found' });
    await ci.destroy();
    const updated = await Cart.findByPk(cartId, { include: [{ model: Item }] });
    res.status(200).json(updated);
  } catch (err) {
    logger.error('Remove cart item error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/carts/:cartId/total-price
 * Calculates the total price of all items in the cart
 */
export async function getCartTotalPrice(req, res) {
  try {
    const { cartId } = req.params;
    const cart = await Cart.findByPk(cartId, {
      include: [{ model: Item }],
    });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const totalPrice = cart.Items.reduce((sum, item) => sum + item.price, 0);
    res.status(200).json({ totalPrice });
  } catch (err) {
    logger.error('Get cart total price error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * DELETE /api/carts/:cartId
 * Clears the cart: deletes all cart_items rows for the cart
 */
export async function clearCart(req, res) {
  try {
    const { cartId } = req.params;
    await CartItem.destroy({ where: { cart_id: cartId } });
    res.status(200).json({ message: 'Cart cleared' });
  } catch (err) {
    logger.error('Clear cart error:', err);
    res.status(500).json({ error: err.message });
  }
}

export default {
  createCart,
  getCart,
  getCartByUser,
  addItemToCart,
  removeItemFromCart,
  clearCart,
  getCartTotalPrice,
};
