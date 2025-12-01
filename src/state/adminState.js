/**
 * 管理员认证状态管理
 * 验证通过后端 API 完成，确保凭据安全
 */
import { atom } from 'recoil';

// Session Storage Key
const ADMIN_SESSION_KEY = 'admin_authenticated';

// 获取后端 API 基础 URL
const getApiBase = () => {
  const rc = window.__RUNTIME_CONFIG__ || {};
  return rc.ANALYTICS_API_URL || process.env.REACT_APP_ANALYTICS_API_URL || '/api/analytics';
};

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

/**
 * 验证管理员凭据（通过后端 API）
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<{success: boolean, error?: string}>} - 验证结果
 */
export const validateAdmin = async (username, password) => {
  try {
    const response = await fetch(`${getApiBase()}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return { success: true };
    }

    return {
      success: false,
      error: data.error || '验证失败',
      configured: data.configured,
    };
  } catch (error) {
    console.error('[Admin] Login error:', error);
    return {
      success: false,
      error: '网络错误，请稍后重试',
    };
  }
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
 * 检查管理后台是否已配置（通过后端 API）
 * @returns {Promise<boolean>} - 是否已配置
 */
export const isAdminConfigured = async () => {
  try {
    const response = await fetch(`${getApiBase()}/auth/status`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.configured === true;
  } catch {
    return false;
  }
};
