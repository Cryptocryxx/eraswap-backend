// src/databases/sequelize.js
import { Sequelize } from "sequelize";
import 'dotenv/config';

const sequelize = new Sequelize(
  process.env.DB_NAME ?? 'eraswap',
  process.env.DB_USER ?? 'admin',
  process.env.DB_PASS ?? 'eraswap2025',
  {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? '3306'),
    dialect: 'mysql',
    logging: console.log, // oder false, um Logs zu deaktivieren
  }
);

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Sequelize: Connection has been established successfully.');
  } catch (error) {
    console.error('Sequelize: Unable to connect to the database:', error);
  }
}

testConnection();

export { sequelize };
