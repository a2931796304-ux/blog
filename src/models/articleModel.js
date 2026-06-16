const pool = require('../config/db');

const articleSelectFields = `
  a.id,
  a.title,
  a.content,
  a.cover,
  a.category,
  a.tags,
  a.author_id,
  a.views,
  a.created_at,
  a.updated_at,
  u.username AS author_username,
  u.avatar AS author_avatar
`;

const normalizePagination = ({ page = 1, pageSize = 10 }) => {
  const normalizedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const normalizedPageSize = Math.min(Math.max(Number.parseInt(pageSize, 10) || 10, 1), 100);

  return {
    page: normalizedPage,
    pageSize: normalizedPageSize,
    offset: (normalizedPage - 1) * normalizedPageSize,
  };
};

const findArticleById = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT ${articleSelectFields}
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      WHERE a.id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0];
};

const findArticles = async ({ page, pageSize, category, keyword }) => {
  const { page: normalizedPage, pageSize: normalizedPageSize, offset } = normalizePagination({ page, pageSize });
  const conditions = [];
  const params = [];

  if (category) {
    conditions.push('a.category = ?');
    params.push(category);
  }

  if (keyword) {
    conditions.push('(a.title LIKE ? OR a.content LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `
      SELECT ${articleSelectFields}
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      ${whereClause}
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, normalizedPageSize, offset],
  );

  const [countRows] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM articles a
      ${whereClause}
    `,
    params,
  );

  return {
    rows,
    total: countRows[0].total,
    page: normalizedPage,
    pageSize: normalizedPageSize,
  };
};

const createArticle = async ({ title, content, category, tags, cover, authorId }) => {
  const [result] = await pool.query(
    `
      INSERT INTO articles (title, content, category, tags, cover, author_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [title, content, category || null, JSON.stringify(tags || []), cover || null, authorId],
  );

  return findArticleById(result.insertId);
};

const updateArticleById = async (id, fields) => {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findArticleById(id);
  }

  const setClause = entries.map(([field]) => `${field} = ?`).join(', ');
  const values = entries.map(([, value]) => (fieldValueShouldStringify(value) ? JSON.stringify(value) : value));

  await pool.query(`UPDATE articles SET ${setClause} WHERE id = ?`, [...values, id]);
  return findArticleById(id);
};

const fieldValueShouldStringify = (value) => Array.isArray(value) || (value && typeof value === 'object');

const deleteArticleById = async (id) => {
  const [result] = await pool.query('DELETE FROM articles WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

const incrementArticleViews = async (id) => {
  await pool.query('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);
  return findArticleById(id);
};

module.exports = {
  createArticle,
  deleteArticleById,
  findArticles,
  findArticleById,
  incrementArticleViews,
  updateArticleById,
};