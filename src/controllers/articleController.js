const {
  createArticle,
  deleteArticleById,
  findArticleById,
  findArticles,
  incrementArticleViews,
  updateArticleById,
} = require('../models/articleModel');

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeOptionalString = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return typeof value === 'string' ? value.trim() : '';
};

const normalizeTags = (tags) => {
  if (tags === undefined) {
    return undefined;
  }

  if (tags === null) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => (typeof tag === 'string' ? tag.trim() : String(tag).trim()))
      .filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return null;
};

const parsePostId = (id) => {
  const parsedId = Number.parseInt(id, 10);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const validateRequiredPostParams = ({ title, content, tags }) => {
  if (!title) {
    return 'Title is required.';
  }

  if (!content) {
    return 'Content is required.';
  }

  if (tags === null) {
    return 'Tags must be an array or comma-separated string.';
  }

  return null;
};

const assertPostOwner = (post, userId) => Number(post.author_id) === Number(userId);

const createPost = async (req, res, next) => {
  try {
    const title = normalizeString(req.body.title);
    const content = normalizeString(req.body.content);
    const category = normalizeOptionalString(req.body.category) || null;
    const cover = normalizeOptionalString(req.body.cover) || null;
    const normalizedTags = normalizeTags(req.body.tags);
    const tags = normalizedTags === undefined ? [] : normalizedTags;

    const validationMessage = validateRequiredPostParams({ title, content, tags });

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const post = await createArticle({
      title,
      content,
      category,
      tags,
      cover,
      authorId: req.user.id,
    });

    return res.status(201).json({
      message: 'Post created successfully.',
      post,
    });
  } catch (err) {
    return next(err);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const category = normalizeString(req.query.category);
    const keyword = normalizeString(req.query.keyword);

    const { rows, total, page, pageSize } = await findArticles({
      page: req.query.page,
      pageSize: req.query.pageSize,
      category,
      keyword,
    });

    return res.json({
      posts: rows,
      total,
      page,
      pageSize,
    });
  } catch (err) {
    return next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const id = parsePostId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: 'Invalid post id.' });
    }

    const post = await incrementArticleViews(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    return res.json({ post });
  } catch (err) {
    return next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const id = parsePostId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: 'Invalid post id.' });
    }

    const existingPost = await findArticleById(id);

    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (!assertPostOwner(existingPost, req.user.id)) {
      return res.status(403).json({ message: 'You can only update your own posts.' });
    }

    const fields = {};

    if (req.body.title !== undefined) {
      fields.title = normalizeString(req.body.title);

      if (!fields.title) {
        return res.status(400).json({ message: 'Title cannot be empty.' });
      }
    }

    if (req.body.content !== undefined) {
      fields.content = normalizeString(req.body.content);

      if (!fields.content) {
        return res.status(400).json({ message: 'Content cannot be empty.' });
      }
    }

    if (req.body.category !== undefined) {
      fields.category = normalizeOptionalString(req.body.category) || null;
    }

    if (req.body.cover !== undefined) {
      fields.cover = normalizeOptionalString(req.body.cover) || null;
    }

    if (req.body.tags !== undefined) {
      const tags = normalizeTags(req.body.tags);

      if (tags === null) {
        return res.status(400).json({ message: 'Tags must be an array or comma-separated string.' });
      }

      fields.tags = tags;
    }

    if (!Object.keys(fields).length) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    const post = await updateArticleById(id, fields);

    return res.json({
      message: 'Post updated successfully.',
      post,
    });
  } catch (err) {
    return next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const id = parsePostId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: 'Invalid post id.' });
    }

    const existingPost = await findArticleById(id);

    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (!assertPostOwner(existingPost, req.user.id)) {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    await deleteArticleById(id);

    return res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  updatePost,
};