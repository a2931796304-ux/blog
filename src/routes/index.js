const express = require('express');

const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const healthRoutes = require('./healthRoutes');
const postRoutes = require('./postRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/health', healthRoutes);
router.use('/posts', postRoutes);

module.exports = router;