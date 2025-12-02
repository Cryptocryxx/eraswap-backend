// src/databases/database.js
import 'dotenv/config';
import { sequelize } from './sequelize.js';
import Item from '../models/item.js';
import logger from '../logging/logger.js'; // optional

/**
 * Initialisiert die Datenbank und synchronisiert alle Modelle
 */
async function initializeDB() {
  try {
    await sequelize.sync({ alter: true }); // Tabellen erstellen/aktualisieren
    logger.info('All models were synchronized successfully.');
    console.log('All models were synchronized successfully.');
  } catch (err) {
    logger.error('Error during DB initialization:', err);
    console.error('Error during DB initialization:', err);
    throw err;
  }
}

/**
 * Hilfsfunktion, falls man in anderen Dateien Zugriff auf den Sequelize-Client braucht
 */
function getDB() {
  return sequelize;
}

export { initializeDB, getDB };
