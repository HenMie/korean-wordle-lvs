/**
 * 管理员认证状态管理
 */
import { atom } from 'recoil';

// Session Storage Key
const ADMIN_SESSION_KEY = 'admin_authenticated';

// 检查是否已登录（从 sessionStorage 恢复）
const getInitialAuthState = () => {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

// 管理员认证状态
export const adminAuthState = atom({
  key: 'adminAuthState',
  default: getInitialAuthState(),
});

const getAdminConfig = () => {
  const rc = window.__RUNTIME_CONFIG__ || {};
  return {
    username: rc.ADMIN_USERNAME || process.env.REACT_APP_ADMIN_USERNAME || '',
    password: rc.ADMIN_PASSWORD || process.env.REACT_APP_ADMIN_PASSWORD || '',
  };
};

/**
 * 验证管理员凭据
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {boolean} - 是否验证成功
 */
export const validateAdmin = (username, password) => {
  const { username: adminUsername, password: adminPassword } = getAdminConfig();

  // 检查是否配置了管理员账号
  if (!adminUsername || !adminPassword) {
    return false;
  }

  return username === adminUsername && password === adminPassword;
};

/**
 * 保存登录状态到 sessionStorage
 */
export const saveAuthState = (isAuthenticated) => {
  try {
    if (isAuthenticated) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {
    // sessionStorage 不可用时忽略
  }
};

/**
 * 检查管理后台是否已配置
 */
export const isAdminConfigured = () => {
  const { username, password } = getAdminConfig();
  return !!(username && password);
};

