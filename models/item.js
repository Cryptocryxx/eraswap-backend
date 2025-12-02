// models/Item.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/sequelize.js'; // dein MySQL-Pool/Sequelize-Setup

const Item = sequelize.define('item', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'General',
  }
}, {
  timestamps: false, // erstellt automatisch createdAt und updatedAt
});

export default Item;
