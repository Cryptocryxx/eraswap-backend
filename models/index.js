// models/index.js
import User from './user.js';
import Item from './item.js';
import Order from './order.js';
import Cart from './cart.js';
import CartItem from './cartItem.js';
import Inventory from './inventory.js';
import InventoryItem from './inventoryItem.js';

// ---- Users <-> Orders ----
User.hasMany(Order, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// ---- Orders <-> Items (1:n): Item.order_id ----
Order.hasMany(Item, { foreignKey: 'order_id', onDelete: 'SET NULL' });
Item.belongsTo(Order, { foreignKey: 'order_id', onDelete: 'SET NULL' });

// ---- Users <-> Carts ----
User.hasMany(Cart, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// ---- Carts <-> Items (m:n via CartItem) ----
Cart.belongsToMany(Item, {
  through: CartItem,
  foreignKey: 'cart_id',
  otherKey: 'item_id',
});
Item.belongsToMany(Cart, {
  through: CartItem,
  foreignKey: 'item_id',
  otherKey: 'cart_id',
});

// ---- Users <-> Inventory ----
User.hasMany(Inventory, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Inventory.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// ---- Inventory <-> Items (m:n via InventoryItem) ----
Inventory.belongsToMany(Item, {
  through: InventoryItem,
  foreignKey: 'inventory_id',
  otherKey: 'item_id',
});
Item.belongsToMany(Inventory, {
  through: InventoryItem,
  foreignKey: 'item_id',
  otherKey: 'inventory_id',
});

// Export models for convenience
export {
  User,
  Item,
  Order,
  Cart,
  CartItem,
  Inventory,
  InventoryItem,
};
