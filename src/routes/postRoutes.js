const express = require('express');

const {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  updatePost,
} = require('../controllers/articleController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', authMiddleware, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;