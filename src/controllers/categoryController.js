const { findAllCategories } = require('../models/categoryModel');

const getCategories = async (_req, res, next) => {
  try {
    const categories = await findAllCategories();
    return res.json({ categories });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getCategories,
};