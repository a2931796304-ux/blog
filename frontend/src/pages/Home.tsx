import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { getApiErrorMessage } from '../services/api';

type Post = {
  id: number;
  title: string;
  cover: string | null;
  category: string | null;
  tags: string[];
  author_username: string;
  author_avatar: string | null;
  views: number;
  created_at: string;
};

type Category = {
  id: number;
  name: string;
};

type PostsResponse = {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
};

type CategoriesResponse = {
  categories: Category[];
};

const PAGE_SIZE = 10;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = Math.max(Number.parseInt(searchParams.get('page') || '1', 10) || 1, 1);
  const initialCategory = searchParams.get('category') || '';
  const initialKeyword = searchParams.get('keyword') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [category, setCategory] = useState(initialCategory);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchInput, setSearchInput] = useState(initialKeyword);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get<CategoriesResponse>('/categories');
      setCategories(data.categories);
    } catch {
      // categories are optional, silent fail
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params: Record<string, string | number> = {
        page,
        pageSize: PAGE_SIZE,
      };

      if (category) {
        params.category = category;
      }

      if (keyword) {
        params.keyword = keyword;
      }

      const { data } = await api.get<PostsResponse>('/posts', { params });
      setPosts(data.posts);
      setTotal(data.total);
    } catch (err) {
      setError(getApiErrorMessage(err, '获取文章列表失败。'));
    } finally {
      setLoading(false);
    }
  }, [category, keyword, page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPosts();
    const params: Record<string, string> = {};

    if (page > 1) {
      params.page = String(page);
    }

    if (category) {
      params.category = category;
    }

    if (keyword) {
      params.keyword = keyword;
    }

    setSearchParams(params, { replace: true });
  }, [page, category, keyword, fetchPosts, setSearchParams]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(searchInput.trim());
    setPage(1);
  };

  const handleCategoryClick = (categoryName: string) => {
    setCategory(categoryName === category ? '' : categoryName);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return (
      <div className="pagination">
        <button
          className="pagination-button"
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
          type="button"
        >
          上一页
        </button>

        {pages.map((p, index) =>
          typeof p === 'string' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={p}
              className={`pagination-button ${p === page ? 'pagination-button--active' : ''}`}
              onClick={() => handlePageChange(p)}
              type="button"
            >
              {p}
            </button>
          ),
        )}

        <button
          className="pagination-button"
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
          type="button"
        >
          下一页
        </button>
      </div>
    );
  };

  return (
    <div className="home-page">
      <div className="home-toolbar">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="搜索文章标题或内容..."
            value={searchInput}
          />
          <button className="search-button" type="submit">
            搜索
          </button>
        </form>

        {categories.length > 0 && (
          <div className="category-tags">
            <button
              className={`category-tag ${!category ? 'category-tag--active' : ''}`}
              onClick={() => handleCategoryClick('')}
              type="button"
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                className={`category-tag ${category === cat.name ? 'category-tag--active' : ''}`}
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                type="button"
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="loading-text">加载中...</p>
      ) : posts.length === 0 ? (
        <div className="card empty-state">
          <p>暂无文章。</p>
          {keyword && <p>试试更换搜索关键词？</p>}
        </div>
      ) : (
        <>
          <div className="post-list">
            {posts.map((post) => (
              <Link className="post-card" key={post.id} to={`/post/${post.id}`}>
                {post.cover && (
                  <div className="post-card-cover">
                    <img alt={post.title} loading="lazy" src={post.cover} />
                  </div>
                )}
                <div className="post-card-body">
                  <h2 className="post-card-title">{post.title}</h2>
                  <div className="post-card-meta">
                    {post.category && <span className="meta-category">{post.category}</span>}
                    <span className="meta-author">{post.author_username}</span>
                    <span className="meta-date">{formatDate(post.created_at)}</span>
                    <span className="meta-views">{post.views} 次阅读</span>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="post-card-tags">
                      {post.tags.map((tag) => (
                        <span className="tag-badge" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {renderPagination()}

          <p className="post-count">
            共 {total} 篇文章
          </p>
        </>
      )}
    </div>
  );
};

export default Home;