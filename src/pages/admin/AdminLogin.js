/**
 * 管理员登录页面
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useRecoilState } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUser, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { adminAuthState, validateAdmin, saveAuthState, isAdminConfigured } from '@state/adminState';
import '@styles/pages/_admin.scss';

function AdminLogin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useRecoilState(adminAuthState);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 如果已登录，重定向到仪表板
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 检查是否配置了管理员账号
  const configured = isAdminConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 模拟网络延迟，增加安全感
    await new Promise(resolve => setTimeout(resolve, 500));

    if (validateAdmin(username, password)) {
      setIsAuthenticated(true);
      saveAuthState(true);
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('用户名或密码错误');
    }

    setIsLoading(false);
  };

  return (
    <div className="admin-login">
      <Helmet>
        <title>管理员登录 | 한글 Wordle</title>
      </Helmet>

      <div className="admin-login__container">
        <div className="admin-login__header">
          <div className="admin-login__icon">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <h1 className="admin-login__title">管理后台</h1>
          <p className="admin-login__subtitle">请输入管理员凭据</p>
        </div>

        {!configured && (
          <div className="admin-login__warning">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>管理员账号未配置，请在环境变量中设置</span>
          </div>
        )}

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="admin-login__field">
            <label htmlFor="username">
              <FontAwesomeIcon icon={faUser} />
              <span>用户名</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              autoComplete="username"
              disabled={!configured}
            />
          </div>

          <div className="admin-login__field">
            <label htmlFor="password">
              <FontAwesomeIcon icon={faLock} />
              <span>密码</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              autoComplete="current-password"
              disabled={!configured}
            />
          </div>

          {error && (
            <div className="admin-login__error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login__submit"
            disabled={isLoading || !configured}
          >
            {isLoading ? '验证中...' : '登录'}
          </button>
        </form>

        <button
          className="admin-login__back"
          onClick={() => navigate('/')}
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;

