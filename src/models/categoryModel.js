const pool = require('../config/db');

const findAllCategories = async () => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
  return rows;
};

module.exports = {
  findAllCategories,
};