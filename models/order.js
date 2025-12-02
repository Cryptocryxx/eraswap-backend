// models/Order.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/sequelize.js';
import User from './user.js';

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'orders',
    timestamps: false, // wir nutzen eigenes timestamp-Feld
  }
);

export default Order;
