import ReactMarkdown from 'react-markdown';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getApiErrorMessage } from '../services/api';

/* ---------- API response types ---------- */

type Category = {
  id: number;
  name: string;
};

type CategoriesResponse = {
  categories: Category[];
};

type PostDetail = {
  id: number;
  title: string;
  content: string;
  cover: string | null;
  category: string | null;
  tags: string[];
  author_id: number;
  author_username: string;
  author_avatar: string | null;
  views: number;
  created_at: string;
  updated_at: string;
};

type PostDetailResponse = {
  post: PostDetail;
};

type SavePayload = {
  title: string;
  content: string;
  category?: string;
  tags: string[];
  cover?: string;
};

/* ---------- helpers ---------- */

const normalizeTagsInput = (raw: string): string[] =>
  raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

const tagsToString = (tags: string[]): string => tags.join(', ');

/* ---------- component ---------- */

const WritePost = () => {
  const navigate = useNavigate();

  /* edit-mode params */
  const { id: editId } = useParams<{ id?: string }>();
  const isEditMode = Boolean(editId);

  /* form state */
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [cover, setCover] = useState('');
  const [content, setContent] = useState('');

  /* UI state */
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingPost, setLoadingPost] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadedPostId, setLoadedPostId] = useState<number | null>(null);

  /* ---------- load categories ---------- */

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get<CategoriesResponse>('/categories');
      setCategories(data.categories);
    } catch {
      /* non-critical */
    }
  }, []);

  /* ---------- load existing post for edit ---------- */

  const fetchPost = useCallback(async () => {
    if (!editId) return;

    setLoadingPost(true);
    setError('');

    try {
      const { data } = await api.get<PostDetailResponse>(`/posts/${editId}`);
      const p = data.post;

      setTitle(p.title);
      setCategory(p.category ?? '');
      setTagsInput(tagsToString(p.tags ?? []));
      setCover(p.cover ?? '');
      setContent(p.content);
      setLoadedPostId(p.id);
    } catch (err) {
      setError(getApiErrorMessage(err, '加载文章失败。'));
    } finally {
      setLoadingPost(false);
    }
  }, [editId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  /* ---------- submit ---------- */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    const payload: SavePayload = {
      title: title.trim(),
      content: content.trim(),
      tags: normalizeTagsInput(tagsInput),
    };

    if (category) {
      payload.category = category.trim();
    }

    if (cover.trim()) {
      payload.cover = cover.trim();
    }

    try {
      if (isEditMode && loadedPostId) {
        await api.put(`/posts/${loadedPostId}`, payload);
      } else {
        await api.post('/posts', payload);
      }

      navigate(isEditMode && loadedPostId ? `/post/${loadedPostId}` : '/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, '保存文章失败。'));
      setSaving(false);
    }
  };

  /* ---------- render ---------- */

  if (loadingPost) {
    return <p className="loading-text">加载文章数据...</p>;
  }

  return (
    <section className="editor-page">
      <h1 className="editor-heading">{isEditMode ? '编辑文章' : '写文章'}</h1>

      {error && <p className="form-error">{error}</p>}

      <form className="editor-form" onSubmit={handleSubmit}>
        {/* top fields */}
        <div className="editor-meta">
          <label className="editor-field">
            <span>标题</span>
            <input
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题"
              required
              value={title}
            />
          </label>

          <label className="editor-field">
            <span>分类</span>
            <select
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="">不选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <label className="editor-field">
            <span>标签（逗号分隔）</span>
            <input
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例如：React, TypeScript"
              value={tagsInput}
            />
          </label>

          <label className="editor-field">
            <span>封面图片 URL</span>
            <input
              onChange={(e) => setCover(e.target.value)}
              placeholder="https://example.com/image.jpg"
              value={cover}
            />
          </label>
        </div>

        {/* split editor + preview */}
        <div className="editor-split">
          <div className="editor-pane">
            <div className="editor-pane-header">编辑</div>
            <textarea
              className="editor-textarea"
              onChange={(e) => setContent(e.target.value)}
              placeholder="使用 Markdown 编写文章内容..."
              required
              value={content}
            />
          </div>

          <div className="editor-pane">
            <div className="editor-pane-header">预览</div>
            <div className="card markdown-body editor-preview">
              {content.trim() ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                <p className="editor-preview-empty">在左侧输入内容，这里会实时显示预览效果</p>
              )}
            </div>
          </div>
        </div>

        <div className="editor-actions">
          <button className="form-button" disabled={saving} type="submit">
            {saving ? '保存中...' : isEditMode ? '更新文章' : '发布文章'}
          </button>
          <button
            className="secondary-button"
            onClick={() => navigate(-1)}
            type="button"
          >
            取消
          </button>
        </div>
      </form>
    </section>
  );
};

export default WritePost;