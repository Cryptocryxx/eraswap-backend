// src/db.ts
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
function getPool() {
    console.log('Checking if pool exists...');
    if (!_pool) {
        console.log('Pool not found, creating new pool...');
        _pool = mysql.createPool(config);
    } else {
        console.log('Pool already exists, reusing the existing pool...');
    }
    return _pool;
}

// Simple Query Helper (prepared)
async function q(sql, params) {
    console.log(`Executing query: ${sql}`);
    console.log(`With parameters: ${JSON.stringify(params)}`);
    try {
        const [rows] = await getPool().query(sql, params);
        console.log(`Query successful, returned rows: ${JSON.stringify(rows)}`);
        return rows;
    } catch (err) {
        console.error(`Error executing query: ${err.message}`);
        throw err;
    }
}

// Transaktion Helper
async function withTransaction(fn) {
    console.log('Starting transaction...');
    const pool = getPool();
    const cx = await pool.getConnection();
    console.log('Got a new connection for transaction.');
    
    try {
        await cx.beginTransaction();
        console.log('Transaction started.');

        const result = await fn(cx);
        console.log('Transaction function executed successfully.');

        await cx.commit();
        console.log('Transaction committed.');

        return result;
    }
    catch (err) {
        console.error('Error during transaction, rolling back...', err.message);
        await cx.rollback();
        throw err;
    }
    finally {
        console.log('Releasing connection...');
        cx.release();
    }
}

// Graceful shutdown
async function closePool() {
    console.log('Attempting to close the pool...');
    if (_pool) {
        await _pool.end();
        console.log('Pool closed successfully.');
        _pool = undefined;
    } else {
        console.log('No pool to close.');
    }
}

export default {
    getPool,
    q,
    withTransaction,
    closePool
};
