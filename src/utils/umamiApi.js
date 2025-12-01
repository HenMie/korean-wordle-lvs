/**
 * Umami API 服务
 */

const getConfig = () => {
  const rc = window.__RUNTIME_CONFIG__ || {};
  return {
    apiUrl: rc.UMAMI_API_URL || process.env.REACT_APP_UMAMI_API_URL || '',
    apiToken: rc.UMAMI_API_TOKEN || process.env.REACT_APP_UMAMI_API_TOKEN || '',
    websiteId: rc.UMAMI_WEBSITE_ID || process.env.REACT_APP_UMAMI_WEBSITE_ID || '',
  };
};

/**
 * 创建请求头
 * Umami Cloud 使用 x-umami-api-key header
 * Self-hosted 使用 Authorization: Bearer header
 */
const getHeaders = () => {
  const { apiUrl, apiToken } = getConfig();
  const isCloud = apiUrl.includes('api.umami.is');
  
  if (isCloud) {
    return {
      'x-umami-api-key': apiToken,
      'Accept': 'application/json',
    };
  }
  
  return {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };
};

/**
 * 检查 API 是否已配置
 */
export const isApiConfigured = () => {
  const { apiUrl, apiToken, websiteId } = getConfig();
  return !!(apiUrl && apiToken && websiteId);
};

/**
 * 通用请求函数
 */
const apiRequest = async (endpoint, params = {}) => {
  const { apiUrl, websiteId } = getConfig();
  
  if (!isApiConfigured()) {
    throw new Error('Umami API 未配置');
  }

  const queryString = new URLSearchParams(params).toString();
  // Umami Cloud: /v1/websites/..., Self-hosted: /api/websites/...
  const basePath = apiUrl.includes('api.umami.is') ? '/v1/websites' : '/api/websites';
  const url = `${apiUrl}${basePath}/${websiteId}${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`);
  }

  return response.json();
};

const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getStats = async ({ startAt, endAt, unit = 'day' }) => {
  return apiRequest('/stats', { startAt, endAt, unit, timezone: getTimezone() });
};

export const getPageviews = async ({ startAt, endAt, unit = 'day' }) => {
  return apiRequest('/pageviews', { startAt, endAt, unit, timezone: getTimezone() });
};

export const getMetrics = async ({ startAt, endAt, type, limit = 10, unit = 'day' }) => {
  return apiRequest('/metrics', { startAt, endAt, type, limit, unit, timezone: getTimezone() });
};

/**
 * 获取活跃访客
 */
export const getActiveVisitors = async () => {
  return apiRequest('/active');
};

export const getEvents = async ({ startAt, endAt, unit = 'day' }) => {
  return apiRequest('/events', { startAt, endAt, unit, timezone: getTimezone() });
};

export const getEventData = async ({ startAt, endAt }) => {
  return getMetrics({ startAt, endAt, type: 'event', limit: 50 });
};

const umamiApi = {
  isApiConfigured,
  getStats,
  getPageviews,
  getMetrics,
  getActiveVisitors,
  getEvents,
  getEventData,
};

export default umamiApi;

