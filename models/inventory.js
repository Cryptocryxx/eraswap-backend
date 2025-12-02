// models/Inventory.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/sequelize.js';

const Inventory = sequelize.define(
  'Inventory',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    // user_id via association
  },
  {
    tableName: 'inventory',
    timestamps: false,
  }
);

export default Inventory;