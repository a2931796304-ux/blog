const pool = require('../config/db');

const publicUserFields = 'id, username, email, avatar, created_at';

const findUserByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
  return rows[0];
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await pool.query(`SELECT ${publicUserFields} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0];
};

const createUser = async ({ username, email, password }) => {
  const [result] = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
  return findUserById(result.insertId);
};

module.exports = {
  findUserByUsername,
  findUserByEmail,
  findUserById,
  createUser,
};