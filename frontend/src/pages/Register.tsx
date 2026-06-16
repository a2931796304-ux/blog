import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register({ username, email, password });
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, '注册失败，请检查输入信息。'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card auth-card">
      <h1>注册</h1>
      <p>创建账号后会自动登录。</p>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          <span>用户名</span>
          <input
            autoComplete="username"
            maxLength={20}
            minLength={3}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="3-20 个字符"
            required
            value={username}
          />
        </label>
        <label>
          <span>邮箱</span>
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="请输入邮箱"
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          <span>密码</span>
          <input
            autoComplete="new-password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="至少 6 个字符"
            required
            type="password"
            value={password}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? '注册中...' : '注册'}
        </button>
      </form>
      <p className="auth-tip">
        已有账号？<Link to="/login">去登录</Link>
      </p>
    </section>
  );
};

export default Register;