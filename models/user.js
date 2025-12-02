// models/User.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/sequelize.js';

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50], // mindestens 3, maximal 50 Zeichen
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'user', // z.B. 'user', 'admin'
  },
}, {
  timestamps: false, // createdAt + updatedAt
  tableName: 'users',
});

export default User;
