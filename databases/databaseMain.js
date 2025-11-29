// Imports
const log = require("../logging/logger");
import 'dotenv/config';
import mysql, {} from 'mysql2/promise';
// Streng/Defaults, damit exactOptionalPropertyTypes nicht meckert
const config = {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USER ?? 'admin',
    password: process.env.DB_PASS ?? 'eraswap2025',
    database: process.env.DB_NAME ?? 'eraswap',
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true
};
// Singleton
let _pool;
export function getPool() {
    if (!_pool) {
        _pool = mysql.createPool(config);
    }
    return _pool;
}
// Simple Query Helper (prepared)
export async function q(sql, params) {
    const [rows] = await getPool().query(sql, params);
    return rows;
}
// Transaktion Helper
export async function withTransaction(fn) {
    const pool = getPool();
    const cx = await pool.getConnection();
    try {
        await cx.beginTransaction();
        const result = await fn(cx);
        await cx.commit();
        return result;
    }
    catch (err) {
        await cx.rollback();
        throw err;
    }
    finally {
        cx.release();
    }
}
// Graceful shutdown
export async function closePool() {
    if (_pool) {
        await _pool.end();
        _pool = undefined;
    }
}

let db = null;

function getDB(){
    return db;
}


/**
 * Diese Methode dient dazu, die erforderlichen Datenbank-Collections zu initialisieren.
 * 
 * @return: Object -> Ein Objekt, das die initialisierten Collections `personalInformation`, `invitations` und `events` enthält
 */

async function initializeCollections() {
    const users = db.collection("users");
    const items = db.collection("items");
   return {
        users: users,
        items: items,
    };
}


module.exports = {
    initializeCollections,
};