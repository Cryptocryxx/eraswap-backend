import { getPool } from './database.js';
export async function getAllUsers() {
    const [rows] = await getPool().query('SELECT * FROM users');
    return rows;
}
export async function createUser(user) {
    const sql = `
    INSERT INTO users (username, firstname, lastname, birthday)
    VALUES (?, ?, ?, ?)
  `;
    const [result] = await getPool().execute(sql, [
        user.username,
        user.firstname,
        user.lastname,
        user.birthday ?? null,
    ]);
    return result.insertId;
}
