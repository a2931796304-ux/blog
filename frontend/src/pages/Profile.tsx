import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { logout, user } = useAuth();

  return (
    <section className="card">
      <h1>个人中心</h1>
      <div className="profile-panel">
        <p>
          <strong>用户名：</strong>{user?.username}
        </p>
        <p>
          <strong>邮箱：</strong>{user?.email ?? '未提供'}
        </p>
        <p>
          <strong>用户 ID：</strong>{user?.id}
        </p>
        <button className="secondary-button" type="button" onClick={logout}>
          退出登录
        </button>
      </div>
    </section>
  );
};

export default Profile;