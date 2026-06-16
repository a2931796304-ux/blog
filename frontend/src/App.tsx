import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Register from './pages/Register';
import WritePost from './pages/WritePost';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          个人博客
        </Link>
        <nav className="nav-links">
          <NavLink to="/">首页</NavLink>
          <NavLink to="/write">写文章</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/profile">{user?.username ?? '个人中心'}</NavLink>
              <button className="link-button" type="button" onClick={logout}>
                退出
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">登录</NavLink>
              <NavLink to="/register">注册</NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route
            path="/write"
            element={
              <ProtectedRoute>
                <WritePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/write/:id"
            element={
              <ProtectedRoute>
                <WritePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;