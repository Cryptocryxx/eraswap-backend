// models/CartItem.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/sequelize.js';

const CartItem = sequelize.define(
  'CartItem',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cart_id: { type: DataTypes.INTEGER, allowNull: false },
    item_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'cart_items',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['cart_id', 'item_id'] }
    ]
  }
);

export default CartItem;
