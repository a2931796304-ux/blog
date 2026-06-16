import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../services/api';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ username, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, '登录失败，请检查用户名和密码。'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card auth-card">
      <h1>登录</h1>
      <p>登录后可以写文章、访问个人中心。</p>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          <span>用户名</span>
          <input
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
            placeholder="请输入用户名"
            required
            value={username}
          />
        </label>
        <label>
          <span>密码</span>
          <input
            autoComplete="current-password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入密码"
            required
            type="password"
            value={password}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? '登录中...' : '登录'}
        </button>
      </form>
      <p className="auth-tip">
        还没有账号？<Link to="/register">去注册</Link>
      </p>
    </section>
  );
};

export default Login;