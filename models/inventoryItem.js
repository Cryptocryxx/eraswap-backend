// models/InventoryItem.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/sequelize.js';

const InventoryItem = sequelize.define(
  'InventoryItem',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // inventory_id, item_id via associations
  },
  {
    tableName: 'inventory_items',
    timestamps: false,
  }
);

export default InventoryItem;