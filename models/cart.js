// models/Cart.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/sequelize.js';

const Cart = sequelize.define(
  'Cart',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    // user_id via association
  },
  {
    tableName: 'carts',
    timestamps: false,
  }
);

export default Cart;