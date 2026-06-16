import ReactMarkdown from 'react-markdown';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { getApiErrorMessage } from '../services/api';

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

type DeleteResponse = {
  message: string;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hours}:${minutes}`;
};

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isOwner = user !== null && post !== null && user.id === post.author_id;

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get<PostDetailResponse>(`/posts/${id}`);
      setPost(data.post);
    } catch (err) {
      setError(getApiErrorMessage(err, '获取文章详情失败。'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await api.delete<DeleteResponse>(`/posts/${id}`);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, '删除文章失败。'));
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="loading-text">加载中...</p>;
  }

  if (error && !post) {
    return (
      <div className="card empty-state">
        <p className="form-error">{error}</p>
        <Link to="/">← 返回首页</Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="card empty-state">
        <p>文章不存在或已被删除。</p>
        <Link to="/">← 返回首页</Link>
      </div>
    );
  }

  return (
    <article className="post-detail">
      {error && <p className="form-error">{error}</p>}

      {post.cover && (
        <div className="post-detail-cover">
          <img alt={post.title} src={post.cover} />
        </div>
      )}

      <h1 className="post-detail-title">{post.title}</h1>

      <div className="post-detail-meta">
        <span className="detail-author">
          {post.author_avatar && (
            <img
              alt={post.author_username}
              className="detail-author-avatar"
              src={post.author_avatar}
            />
          )}
          {post.author_username}
        </span>
        {post.category && <span className="meta-category">{post.category}</span>}
        <span className="detail-date">{formatDate(post.created_at)}</span>
        <span className="detail-views">{post.views} 次阅读</span>
        {post.updated_at !== post.created_at && (
          <span className="detail-updated">（更新于 {formatDate(post.updated_at)}）</span>
        )}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="post-detail-tags">
          {post.tags.map((tag) => (
            <span className="tag-badge" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {isOwner && (
        <div className="post-detail-actions">
          <button
            className="secondary-button"
            onClick={() => navigate(`/write/${post.id}`)}
            type="button"
          >
            编辑
          </button>
          <button
            className="danger-button"
            disabled={deleting}
            onClick={handleDelete}
            type="button"
          >
            {deleting ? '删除中...' : '删除'}
          </button>
        </div>
      )}

      <hr className="post-detail-divider" />

      <div className="card markdown-body">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div className="post-detail-back">
        <Link to="/">← 返回首页</Link>
      </div>
    </article>
  );
};

export default PostDetail;