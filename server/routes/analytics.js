/**
 * Umami Analytics API 代理路由
 * 确保 API Token 安全存储在服务器端
 */

const express = require('express');
const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// 管理员认证
// ═══════════════════════════════════════════════════════════════════════════

// 管理员配置
const getAdminConfig = () => ({
  username: process.env.ADMIN_USERNAME || '',
  password: process.env.ADMIN_PASSWORD || '',
});

// 检查管理员是否已配置
const isAdminConfigured = () => {
  const { username, password } = getAdminConfig();
  return !!(username && password);
};

// 管理员登录验证
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!isAdminConfigured()) {
    return res.status(503).json({
      success: false,
      error: '管理员账号未配置',
      configured: false,
    });
  }

  const config = getAdminConfig();

  if (username === config.username && password === config.password) {
    res.json({
      success: true,
      message: '登录成功',
    });
  } else {
    res.status(401).json({
      success: false,
      error: '用户名或密码错误',
    });
  }
});

// 检查管理员配置状态
router.get('/auth/status', (req, res) => {
  res.json({
    configured: isAdminConfigured(),
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Umami Analytics API 代理
// ═══════════════════════════════════════════════════════════════════════════

// Umami 配置
const getUmamiConfig = () => ({
  apiUrl: process.env.UMAMI_API_URL || '',
  apiToken: process.env.UMAMI_API_TOKEN || '',
  websiteId: process.env.UMAMI_WEBSITE_ID || '',
});

// 检查配置是否完整
const isConfigured = () => {
  const { apiUrl, apiToken, websiteId } = getUmamiConfig();
  return !!(apiUrl && apiToken && websiteId);
};

// 获取请求头
const getHeaders = () => {
  const { apiUrl, apiToken } = getUmamiConfig();
  const isCloud = apiUrl.includes('api.umami.is');

  if (isCloud) {
    return {
      'x-umami-api-key': apiToken,
      Accept: 'application/json',
    };
  }

  return {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };
};

// 获取时区
const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// 通用代理函数
const proxyRequest = async (endpoint, queryParams = {}) => {
  const { apiUrl, websiteId } = getUmamiConfig();

  if (!isConfigured()) {
    throw new Error('Umami API 未配置');
  }

  // 添加时区参数
  const params = { ...queryParams, timezone: queryParams.timezone || getTimezone() };
  const queryString = new URLSearchParams(params).toString();

  // Umami Cloud: /v1/websites/..., Self-hosted: /api/websites/...
  const basePath = apiUrl.includes('api.umami.is') ? '/v1/websites' : '/api/websites';
  const url = `${apiUrl}${basePath}/${websiteId}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Umami API 请求失败: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// 检查配置状态
router.get('/status', (req, res) => {
  res.json({
    configured: isConfigured(),
    hasApiUrl: !!process.env.UMAMI_API_URL,
    hasApiToken: !!process.env.UMAMI_API_TOKEN,
    hasWebsiteId: !!process.env.UMAMI_WEBSITE_ID,
  });
});

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    const { startAt, endAt, unit } = req.query;
    const data = await proxyRequest('/stats', { startAt, endAt, unit });
    res.json(data);
  } catch (error) {
    console.error('[Analytics] Stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 获取页面浏览数据
router.get('/pageviews', async (req, res) => {
  try {
    const { startAt, endAt, unit } = req.query;
    const data = await proxyRequest('/pageviews', { startAt, endAt, unit });
    res.json(data);
  } catch (error) {
    console.error('[Analytics] Pageviews error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 获取指标数据
router.get('/metrics', async (req, res) => {
  try {
    const { startAt, endAt, type, limit, unit } = req.query;
    const data = await proxyRequest('/metrics', { startAt, endAt, type, limit, unit });
    res.json(data);
  } catch (error) {
    console.error('[Analytics] Metrics error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 获取活跃访客
router.get('/active', async (req, res) => {
  try {
    const data = await proxyRequest('/active');
    res.json(data);
  } catch (error) {
    console.error('[Analytics] Active visitors error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 获取事件数据
router.get('/events', async (req, res) => {
  try {
    const { startAt, endAt, unit } = req.query;
    const data = await proxyRequest('/events', { startAt, endAt, unit });
    res.json(data);
  } catch (error) {
    console.error('[Analytics] Events error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 获取事件属性字段列表
router.get('/event-data/fields', async (req, res) => {
  try {
    const { startAt, endAt } = req.query;
    const data = await proxyRequest('/event-data/fields', { startAt, endAt });
    res.json(data);
  } catch (error) {
    console.error('[Analytics] Event data fields error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 获取特定事件属性的值分布
router.get('/event-data/values', async (req, res) => {
  try {
    const { startAt, endAt, eventName, fieldName } = req.query;
    const params = { startAt, endAt };
    if (eventName) params.eventName = eventName;
    if (fieldName) params.fieldName = fieldName;
    const data = await proxyRequest('/event-data/values', params);
    res.json(data);
  } catch (error) {
    console.error('[Analytics] Event data values error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 获取事件数据（用于事件计数）
router.get('/event-data', async (req, res) => {
  try {
    const { startAt, endAt, limit } = req.query;
    // 通过 metrics 端点获取事件计数
    const data = await proxyRequest('/metrics', {
      startAt,
      endAt,
      type: 'event',
      limit: limit || 50,
    });
    res.json(data);
  } catch (error) {
    console.error('[Analytics] Event data error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

