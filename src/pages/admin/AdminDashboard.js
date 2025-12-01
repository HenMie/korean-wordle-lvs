/**
 * 管理员仪表板 - 统计数据页面
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useRecoilState } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faUsers, faEye, faGamepad,
  faArrowLeft, faSignOutAlt, faSync, faExclamationCircle,
  faClock, faGlobe, faDesktop, faMobile
} from '@fortawesome/free-solid-svg-icons';

import { adminAuthState, saveAuthState } from '@state/adminState';
import { isApiConfigured, getStats, getMetrics, getActiveVisitors, getEventData } from '@utils/umamiApi';
import '@styles/pages/_admin.scss';

// 时间范围选项
const TIME_RANGES = {
  '24h': { label: '24小时', ms: 24 * 60 * 60 * 1000 },
  '7d': { label: '7天', ms: 7 * 24 * 60 * 60 * 1000 },
  '30d': { label: '30天', ms: 30 * 24 * 60 * 60 * 1000 },
  '90d': { label: '90天', ms: 90 * 24 * 60 * 60 * 1000 },
};

// 游戏事件名称映射
const EVENT_NAMES = {
  'game_start': '开始游戏',
  'game_end': '完成游戏',
  'guess_submit': '提交猜测',
  'share_result': '分享结果',
  'pvp_room_create': 'PVP创建房间',
  'pvp_room_join': 'PVP加入房间',
  'pvp_game_start': 'PVP开始游戏',
  'pvp_game_end': 'PVP完成游戏',
  'pvp_share': 'PVP分享',
  'pvp_play_again': 'PVP再来一局',
  'info_modal_view': '查看帮助',
  'game_resume': '恢复游戏',
  'view_meaning': '查看释义',
  'setting_change': '更改设置',
  'language_change': '切换语言',
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useRecoilState(adminAuthState);
  
  const [range, setRange] = useState('24h');
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [browsers, setBrowsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 检查是否已登录
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 计算时间范围
  const timeRange = useMemo(() => {
    const endAt = Date.now();
    const startAt = endAt - TIME_RANGES[range].ms;
    return { startAt, endAt };
  }, [range]);

  // 获取数据
  const fetchData = useCallback(async () => {
    if (!isApiConfigured()) {
      setError('Umami API 未配置，请在环境变量中设置 API URL、Token 和 Website ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unit = range === '24h' ? 'hour' : 'day';
      const [
        statsData,
        eventsData,
        pagesData,
        devicesData,
        browsersData,
        countriesData,
        activeData,
      ] = await Promise.all([
        getStats({ ...timeRange, unit }),
        getEventData(timeRange),
        getMetrics({ ...timeRange, type: 'path', limit: 10, unit }),
        getMetrics({ ...timeRange, type: 'device', limit: 5, unit }),
        getMetrics({ ...timeRange, type: 'browser', limit: 5, unit }),
        getMetrics({ ...timeRange, type: 'country', limit: 10, unit }),
        getActiveVisitors().catch(() => ({ visitors: 0 })),
      ]);

      setStats(statsData);
      setEvents(eventsData || []);
      setTopPages(pagesData || []);
      setDevices(devicesData || []);
      setBrowsers(browsersData || []);
      setCountries(countriesData || []);
      setActiveVisitors(activeData?.visitors || 0);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message || '获取统计数据失败');
      console.error('[Admin] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange, range]);

  // 初始加载和时间范围变化时获取数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 登出
  const handleLogout = () => {
    setIsAuthenticated(false);
    saveAuthState(false);
    navigate('/admin', { replace: true });
  };

  // 格式化数字
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  // 格式化时间
  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // 计算跳出率
  const bounceRate = useMemo(() => {
    if (!stats?.bounces || !stats?.visits) return '0%';
    return ((stats.bounces / stats.visits) * 100).toFixed(1) + '%';
  }, [stats]);

  if (!isAuthenticated) return null;

  return (
    <div className="admin-dashboard">
      <Helmet>
        <title>统计数据 | 한글 Wordle</title>
      </Helmet>

      {/* 头部 */}
      <header className="admin-dashboard__header">
        <div className="admin-dashboard__header-left">
          <button className="admin-dashboard__back" onClick={() => navigate('/')}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1>
            <FontAwesomeIcon icon={faChartLine} />
            <span>统计数据</span>
          </h1>
        </div>
        <div className="admin-dashboard__header-right">
          {lastUpdate && (
            <span className="admin-dashboard__update-time">
              <FontAwesomeIcon icon={faClock} />
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button className="admin-dashboard__refresh" onClick={fetchData} disabled={loading}>
            <FontAwesomeIcon icon={faSync} spin={loading} />
          </button>
          <button className="admin-dashboard__logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>退出</span>
          </button>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="admin-dashboard__content">
        {/* 时间范围选择 */}
        <div className="admin-dashboard__range-selector">
          {Object.entries(TIME_RANGES).map(([key, { label }]) => (
            <button
              key={key}
              className={`range-btn ${range === key ? 'active' : ''}`}
              onClick={() => setRange(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="admin-dashboard__error">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>{error}</span>
          </div>
        )}

        {/* 加载状态 */}
        {loading && !stats && (
          <div className="admin-dashboard__loading">
            <FontAwesomeIcon icon={faSync} spin />
            <span>加载中...</span>
          </div>
        )}

        {/* 统计数据 */}
        {stats && (
          <>
            {/* 核心指标 */}
            <section className="admin-dashboard__section">
              <div className="stats-grid">
                <div className="stat-card stat-card--primary">
                  <div className="stat-card__icon">
                    <FontAwesomeIcon icon={faEye} />
                  </div>
                  <div className="stat-card__content">
                    <div className="stat-card__value">{formatNumber(stats.pageviews)}</div>
                    <div className="stat-card__label">页面浏览</div>
                  </div>
                </div>

                <div className="stat-card stat-card--success">
                  <div className="stat-card__icon">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div className="stat-card__content">
                    <div className="stat-card__value">{formatNumber(stats.visitors)}</div>
                    <div className="stat-card__label">独立访客</div>
                  </div>
                </div>

                <div className="stat-card stat-card--info">
                  <div className="stat-card__icon">
                    <FontAwesomeIcon icon={faGamepad} />
                  </div>
                  <div className="stat-card__content">
                    <div className="stat-card__value">{formatNumber(stats.visits)}</div>
                    <div className="stat-card__label">访问次数</div>
                  </div>
                </div>

                <div className="stat-card stat-card--warning">
                  <div className="stat-card__icon">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div className="stat-card__content">
                    <div className="stat-card__value">{formatDuration(stats.totaltime / stats.visits)}</div>
                    <div className="stat-card__label">平均时长</div>
                    <div className="stat-card__sublabel">跳出率: {bounceRate}</div>
                  </div>
                </div>
              </div>

              {/* 实时访客 */}
              <div className="active-visitors">
                <span className="active-visitors__dot"></span>
                <span className="active-visitors__text">
                  当前 <strong>{activeVisitors}</strong> 位访客在线
                </span>
              </div>
            </section>

            {/* 游戏事件 */}
            <section className="admin-dashboard__section">
              <h2>
                <FontAwesomeIcon icon={faGamepad} />
                <span>游戏事件</span>
              </h2>
              <div className="events-grid">
                {events.length > 0 ? (
                  events.map((event, index) => (
                    <div key={index} className="event-item">
                      <span className="event-item__name">
                        {EVENT_NAMES[event.x] || event.x}
                      </span>
                      <span className="event-item__count">{formatNumber(event.y)}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-data">暂无事件数据</div>
                )}
              </div>
            </section>

            {/* 热门页面 */}
            <section className="admin-dashboard__section">
              <h2>
                <FontAwesomeIcon icon={faGlobe} />
                <span>热门页面</span>
              </h2>
              <div className="pages-list">
                {topPages.length > 0 ? (
                  topPages.map((page, index) => (
                    <div key={index} className="page-item">
                      <span className="page-item__rank">#{index + 1}</span>
                      <span className="page-item__url">{page.x || '/'}</span>
                      <span className="page-item__views">{formatNumber(page.y)}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-data">暂无页面数据</div>
                )}
              </div>
            </section>

            {/* 设备和浏览器 */}
            <section className="admin-dashboard__section admin-dashboard__section--split">
              <div className="split-panel">
                <h2>
                  <FontAwesomeIcon icon={faDesktop} />
                  <span>设备类型</span>
                </h2>
                <div className="metric-list">
                  {devices.length > 0 ? (
                    devices.map((device, index) => (
                      <div key={index} className="metric-item">
                        <span className="metric-item__icon">
                          <FontAwesomeIcon icon={device.x === 'mobile' ? faMobile : faDesktop} />
                        </span>
                        <span className="metric-item__name">{device.x || 'Unknown'}</span>
                        <span className="metric-item__value">{formatNumber(device.y)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">暂无数据</div>
                  )}
                </div>
              </div>

              <div className="split-panel">
                <h2>
                  <FontAwesomeIcon icon={faGlobe} />
                  <span>浏览器</span>
                </h2>
                <div className="metric-list">
                  {browsers.length > 0 ? (
                    browsers.map((browser, index) => (
                      <div key={index} className="metric-item">
                        <span className="metric-item__name">{browser.x || 'Unknown'}</span>
                        <span className="metric-item__value">{formatNumber(browser.y)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">暂无数据</div>
                  )}
                </div>
              </div>
            </section>

            {/* 国家/地区 */}
            <section className="admin-dashboard__section">
              <h2>
                <FontAwesomeIcon icon={faGlobe} />
                <span>访客地区</span>
              </h2>
              <div className="countries-grid">
                {countries.length > 0 ? (
                  countries.map((country, index) => (
                    <div key={index} className="country-item">
                      <span className="country-item__name">{country.x || 'Unknown'}</span>
                      <span className="country-item__value">{formatNumber(country.y)}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-data">暂无地区数据</div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;

