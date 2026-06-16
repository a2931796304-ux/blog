const pool = require('../config/db');

const checkHealth = async (req, res, next) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      status: 'ok',
      database: 'connected',
    });
  } catch (err) {
    err.statusCode = 500;
    err.message = 'Database connection failed.';
    next(err);
  }
};

module.exports = {
  checkHealth,
};