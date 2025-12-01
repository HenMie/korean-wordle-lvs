/**
 * Umami API 服务
 * 通过后端代理访问 Umami API，确保 Token 安全
 */

// 获取后端 API 基础 URL
const getApiBase = () => {
  const rc = window.__RUNTIME_CONFIG__ || {};
  // 优先使用运行时配置，其次使用环境变量，默认使用相对路径
  return rc.ANALYTICS_API_URL || process.env.REACT_APP_ANALYTICS_API_URL || '/api/analytics';
};

/**
 * 检查 API 是否已配置（通过后端状态端点检查）
 */
export const isApiConfigured = async () => {
  try {
    const response = await fetch(`${getApiBase()}/status`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.configured === true;
  } catch {
    return false;
  }
};

/**
 * 同步版本的配置检查（用于初始渲染）
 * 后端代理模式下始终返回 true，实际配置状态应通过 isApiConfigured 异步获取
 */
export const isApiConfiguredSync = () => {
  // 使用后端代理模式，假设默认的相对路径（/api/analytics）可用
  return true;
};

/**
 * 通用请求函数
 */
const apiRequest = async (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `${getApiBase()}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API 请求失败: ${response.status}`);
  }

  return response.json();
};

/**
 * 获取统计数据
 */
export const getStats = async ({ startAt, endAt, unit = 'day' }) => {
  return apiRequest('/stats', { startAt, endAt, unit });
};

/**
 * 获取页面浏览数据
 */
export const getPageviews = async ({ startAt, endAt, unit = 'day' }) => {
  return apiRequest('/pageviews', { startAt, endAt, unit });
};

/**
 * 获取指标数据
 */
export const getMetrics = async ({ startAt, endAt, type, limit = 10, unit = 'day' }) => {
  return apiRequest('/metrics', { startAt, endAt, type, limit, unit });
};

/**
 * 获取活跃访客
 */
export const getActiveVisitors = async () => {
  return apiRequest('/active');
};

/**
 * 获取事件数据
 */
export const getEvents = async ({ startAt, endAt, unit = 'day' }) => {
  return apiRequest('/events', { startAt, endAt, unit });
};

/**
 * 获取事件计数数据
 */
export const getEventData = async ({ startAt, endAt, limit = 50 }) => {
  return apiRequest('/event-data', { startAt, endAt, limit });
};

/**
 * 获取事件属性字段列表
 */
export const getEventDataFields = async ({ startAt, endAt }) => {
  return apiRequest('/event-data/fields', { startAt, endAt });
};

/**
 * 获取特定事件属性的值分布
 * @param {object} params - 参数
 * @param {number} params.startAt - 开始时间戳
 * @param {number} params.endAt - 结束时间戳
 * @param {string} [params.eventName] - 事件名称（可选）
 * @param {string} [params.fieldName] - 字段名称（可选）
 */
export const getEventDataValues = async ({ startAt, endAt, eventName, fieldName }) => {
  const params = { startAt, endAt };
  if (eventName) params.eventName = eventName;
  if (fieldName) params.fieldName = fieldName;
  return apiRequest('/event-data/values', params);
};

const umamiApi = {
  isApiConfigured,
  isApiConfiguredSync,
  getStats,
  getPageviews,
  getMetrics,
  getActiveVisitors,
  getEvents,
  getEventData,
  getEventDataFields,
  getEventDataValues,
};

export default umamiApi;
