/**
 * 管理员仪表板 - 统计数据页面
 * 包含基础统计、游戏分析、PVP分析、行为漏斗、用户偏好等模块
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useRecoilState } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faUsers, faEye, faGamepad,
  faArrowLeft, faSignOutAlt, faSync, faExclamationCircle,
  faClock, faGlobe, faDesktop, faMobile, faTrophy,
  faChartPie, faFilter, faCog, faLanguage, faUserFriends
} from '@fortawesome/free-solid-svg-icons';

import { adminAuthState, saveAuthState } from '@state/adminState';
import {
  isApiConfigured,
  getStats,
  getMetrics,
  getActiveVisitors,
  getEventData,
  getEventDataFields,
  getEventDataValues
} from '@utils/umamiApi';
import '@styles/pages/_admin.scss';

// 时间范围选项
const TIME_RANGES = {
  '24h': { label: '24小时', ms: 24 * 60 * 60 * 1000 },
  '7d': { label: '7天', ms: 7 * 24 * 60 * 60 * 1000 },
  '30d': { label: '30天', ms: 30 * 24 * 60 * 60 * 1000 },
  '90d': { label: '90天', ms: 90 * 24 * 60 * 60 * 1000 },
};

// Tab 选项
const TABS = {
  overview: { label: '概览', icon: faChartLine },
  game: { label: '游戏分析', icon: faGamepad },
  pvp: { label: 'PVP分析', icon: faUserFriends },
  funnel: { label: '行为漏斗', icon: faFilter },
  preferences: { label: '用户偏好', icon: faCog },
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

// 难度名称映射
const MODE_NAMES = {
  'easy': '简单',
  'imdt': '中等',
  'hard': '困难',
};

// 语言名称映射
const LANGUAGE_NAMES = {
  'ko': '한국어',
  'en': 'English',
  'zh': '中文',
  'de': 'Deutsch',
  'el': 'Ελληνικά',
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useRecoilState(adminAuthState);
  
  // 基础状态
  const [activeTab, setActiveTab] = useState('overview');
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 概览数据
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [browsers, setBrowsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [activeVisitors, setActiveVisitors] = useState(0);

  // 游戏分析数据
  const [gameAnalysis, setGameAnalysis] = useState({
    modeDistribution: [], // 难度分布
    wordLengthDistribution: [], // 字数分布
    winRate: null, // 胜率数据
    attemptsDistribution: [], // 猜测次数分布
  });

  // PVP 分析数据
  const [pvpAnalysis, setPvpAnalysis] = useState({
    gameModeDistribution: [], // 游戏模式分布
    playerCountDistribution: [], // 玩家数量分布
    completionRate: null, // 完成率
  });

  // 行为漏斗数据
  const [funnelData, setFunnelData] = useState({
    singlePlayer: [], // 单人游戏漏斗
    pvp: [], // PVP 漏斗
  });

  // 用户偏好数据
  const [preferencesData, setPreferencesData] = useState({
    languages: [], // 语言分布
    settings: [], // 设置项使用
  });

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

  // 从事件数据中提取特定事件的计数
  const getEventCount = useCallback((eventName) => {
    const event = events.find(e => e.x === eventName);
    return event?.y || 0;
  }, [events]);

  // 处理事件数据，提取分析信息
  const processEventData = useCallback((eventsData) => {
    // 从事件中提取游戏相关数据
    const gameStart = eventsData.find(e => e.x === 'game_start')?.y || 0;
    const gameEnd = eventsData.find(e => e.x === 'game_end')?.y || 0;
    const shareResult = eventsData.find(e => e.x === 'share_result')?.y || 0;

    const pvpCreate = eventsData.find(e => e.x === 'pvp_room_create')?.y || 0;
    const pvpStart = eventsData.find(e => e.x === 'pvp_game_start')?.y || 0;
    const pvpEnd = eventsData.find(e => e.x === 'pvp_game_end')?.y || 0;

    // 设置漏斗数据
    setFunnelData({
      singlePlayer: [
        { name: '开始游戏', count: gameStart, rate: 100 },
        { name: '完成游戏', count: gameEnd, rate: gameStart > 0 ? Math.round((gameEnd / gameStart) * 100) : 0 },
        { name: '分享结果', count: shareResult, rate: gameEnd > 0 ? Math.round((shareResult / gameEnd) * 100) : 0 },
      ],
      pvp: [
        { name: '创建房间', count: pvpCreate, rate: 100 },
        { name: '开始游戏', count: pvpStart, rate: pvpCreate > 0 ? Math.round((pvpStart / pvpCreate) * 100) : 0 },
        { name: '完成游戏', count: pvpEnd, rate: pvpStart > 0 ? Math.round((pvpEnd / pvpStart) * 100) : 0 },
      ],
    });

    // PVP 完成率
    setPvpAnalysis(prev => ({
      ...prev,
      completionRate: pvpCreate > 0 ? Math.round((pvpEnd / pvpCreate) * 100) : 0,
    }));
  }, []);

  // 获取事件属性值分布
  const fetchEventDataValues = useCallback(async () => {
    try {
      // 尝试获取事件属性数据
      const fieldsData = await getEventDataFields(timeRange).catch(() => []);
      
      if (fieldsData && fieldsData.length > 0) {
        // 获取各种属性值的分布
        const [modeValues, wordLengthValues, resultValues, gameModeValues, languageValues] = await Promise.all([
          getEventDataValues({ ...timeRange, fieldName: 'mode' }).catch(() => []),
          getEventDataValues({ ...timeRange, fieldName: 'wordLength' }).catch(() => []),
          getEventDataValues({ ...timeRange, fieldName: 'result' }).catch(() => []),
          getEventDataValues({ ...timeRange, fieldName: 'gameMode' }).catch(() => []),
          getEventDataValues({ ...timeRange, fieldName: 'language' }).catch(() => []),
        ]);

        // 辅助函数：确保数据是数组
        const ensureArray = (data) => Array.isArray(data) ? data : [];

        // 处理游戏分析数据
        const modeDistribution = ensureArray(modeValues).map(item => ({
          name: MODE_NAMES[item.value] || item.value,
          value: item.value,
          count: item.count || 0,
        }));

        const wordLengthDistribution = ensureArray(wordLengthValues).map(item => ({
          name: `${item.value}字`,
          value: item.value,
          count: item.count || 0,
        }));

        // 计算胜率
        const resultArray = ensureArray(resultValues);
        const winCount = resultArray.find(r => r.value === 'win')?.count || 0;
        const loseCount = resultArray.find(r => r.value === 'lose')?.count || 0;
        const totalGames = winCount + loseCount;

        setGameAnalysis(prev => ({
          ...prev,
          modeDistribution,
          wordLengthDistribution,
          winRate: totalGames > 0 ? {
            total: totalGames,
            wins: winCount,
            losses: loseCount,
            rate: Math.round((winCount / totalGames) * 100),
          } : null,
        }));

        // PVP 游戏模式分布
        const gameModeDistribution = ensureArray(gameModeValues).map(item => ({
          name: item.value === 'race' ? '竞速模式' : (item.value === 'timed' ? '限时模式' : item.value),
          value: item.value,
          count: item.count || 0,
        }));

        setPvpAnalysis(prev => ({
          ...prev,
          gameModeDistribution,
        }));

        // 语言分布
        const languages = ensureArray(languageValues).map(item => ({
          name: LANGUAGE_NAMES[item.value] || item.value,
          value: item.value,
          count: item.count || 0,
        }));

        setPreferencesData(prev => ({
          ...prev,
          languages,
        }));
      }
    } catch (err) {
      console.error('[Admin] Event data values error:', err);
    }
  }, [timeRange]);

  // 获取数据
  const fetchData = useCallback(async () => {
    const configured = await isApiConfigured();
    if (!configured) {
      setError('Umami API 未配置，请在服务器环境变量中设置 UMAMI_API_URL、UMAMI_API_TOKEN 和 UMAMI_WEBSITE_ID');
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

      // 处理事件数据
      processEventData(eventsData || []);

      // 获取事件属性值（用于详细分析）
      await fetchEventDataValues();
    } catch (err) {
      setError(err.message || '获取统计数据失败');
      console.error('[Admin] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange, range, processEventData, fetchEventDataValues]);

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

  // 计算分布的最大值（用于进度条）
  const getMaxCount = (items) => {
    if (!items || items.length === 0) return 1;
    return Math.max(...items.map(item => item.count || item.y || 0), 1);
  };

  if (!isAuthenticated) return null;

  // 渲染概览 Tab
  const renderOverviewTab = () => (
          <>
            {/* 核心指标 */}
            <section className="admin-dashboard__section">
              <div className="stats-grid">
                <div className="stat-card stat-card--primary">
                  <div className="stat-card__icon">
                    <FontAwesomeIcon icon={faEye} />
                  </div>
                  <div className="stat-card__content">
              <div className="stat-card__value">{formatNumber(stats?.pageviews || 0)}</div>
                    <div className="stat-card__label">页面浏览</div>
                  </div>
                </div>

                <div className="stat-card stat-card--success">
                  <div className="stat-card__icon">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div className="stat-card__content">
              <div className="stat-card__value">{formatNumber(stats?.visitors || 0)}</div>
                    <div className="stat-card__label">独立访客</div>
                  </div>
                </div>

                <div className="stat-card stat-card--info">
                  <div className="stat-card__icon">
                    <FontAwesomeIcon icon={faGamepad} />
                  </div>
                  <div className="stat-card__content">
              <div className="stat-card__value">{formatNumber(stats?.visits || 0)}</div>
                    <div className="stat-card__label">访问次数</div>
                  </div>
                </div>

                <div className="stat-card stat-card--warning">
                  <div className="stat-card__icon">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div className="stat-card__content">
              <div className="stat-card__value">{formatDuration((stats?.totaltime || 0) / (stats?.visits || 1))}</div>
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
  );

  // 渲染游戏分析 Tab
  const renderGameTab = () => {
    const { modeDistribution, wordLengthDistribution, winRate } = gameAnalysis;
    const modeMax = getMaxCount(modeDistribution);
    const wordLengthMax = getMaxCount(wordLengthDistribution);

    return (
      <>
        {/* 胜率统计 */}
        <section className="admin-dashboard__section">
          <h2>
            <FontAwesomeIcon icon={faTrophy} />
            <span>游戏胜率</span>
          </h2>
          {winRate ? (
            <div className="win-rate-card">
              <div className="win-rate-card__main">
                <div className="win-rate-card__percentage">{winRate.rate}%</div>
                <div className="win-rate-card__label">胜率</div>
              </div>
              <div className="win-rate-card__details">
                <div className="win-rate-card__stat">
                  <span className="win-rate-card__stat-value win-rate-card__stat-value--win">{formatNumber(winRate.wins)}</span>
                  <span className="win-rate-card__stat-label">胜利</span>
                </div>
                <div className="win-rate-card__stat">
                  <span className="win-rate-card__stat-value win-rate-card__stat-value--lose">{formatNumber(winRate.losses)}</span>
                  <span className="win-rate-card__stat-label">失败</span>
                </div>
                <div className="win-rate-card__stat">
                  <span className="win-rate-card__stat-value">{formatNumber(winRate.total)}</span>
                  <span className="win-rate-card__stat-label">总计</span>
                </div>
              </div>
              <div className="win-rate-card__bar">
                <div
                  className="win-rate-card__bar-fill win-rate-card__bar-fill--win"
                  style={{ width: `${winRate.rate}%` }}
                />
                <div
                  className="win-rate-card__bar-fill win-rate-card__bar-fill--lose"
                  style={{ width: `${100 - winRate.rate}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="no-data">暂无胜率数据</div>
          )}
        </section>

        {/* 难度分布和字数分布 */}
        <section className="admin-dashboard__section admin-dashboard__section--split">
          <div className="split-panel">
            <h2>
              <FontAwesomeIcon icon={faChartPie} />
              <span>难度分布</span>
            </h2>
            <div className="distribution-list">
              {modeDistribution.length > 0 ? (
                modeDistribution.map((item, index) => (
                  <div key={index} className="distribution-item">
                    <div className="distribution-item__header">
                      <span className="distribution-item__name">{item.name}</span>
                      <span className="distribution-item__count">{formatNumber(item.count)}</span>
                    </div>
                    <div className="distribution-item__bar">
                      <div
                        className="distribution-item__bar-fill"
                        style={{ width: `${(item.count / modeMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">暂无数据</div>
              )}
            </div>
          </div>

          <div className="split-panel">
            <h2>
              <FontAwesomeIcon icon={faChartPie} />
              <span>字数分布</span>
            </h2>
            <div className="distribution-list">
              {wordLengthDistribution.length > 0 ? (
                wordLengthDistribution.map((item, index) => (
                  <div key={index} className="distribution-item">
                    <div className="distribution-item__header">
                      <span className="distribution-item__name">{item.name}</span>
                      <span className="distribution-item__count">{formatNumber(item.count)}</span>
                    </div>
                    <div className="distribution-item__bar">
                      <div
                        className="distribution-item__bar-fill distribution-item__bar-fill--alt"
                        style={{ width: `${(item.count / wordLengthMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">暂无数据</div>
              )}
            </div>
          </div>
        </section>

        {/* 游戏相关事件统计 */}
        <section className="admin-dashboard__section">
          <h2>
            <FontAwesomeIcon icon={faGamepad} />
            <span>游戏事件统计</span>
          </h2>
          <div className="stats-grid stats-grid--compact">
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('game_start'))}</div>
                <div className="stat-card__label">开始游戏</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('game_end'))}</div>
                <div className="stat-card__label">完成游戏</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('guess_submit'))}</div>
                <div className="stat-card__label">提交猜测</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('share_result'))}</div>
                <div className="stat-card__label">分享结果</div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  // 渲染 PVP 分析 Tab
  const renderPvpTab = () => {
    const { gameModeDistribution, completionRate } = pvpAnalysis;
    const modeMax = getMaxCount(gameModeDistribution);

    return (
      <>
        {/* PVP 完成率 */}
        <section className="admin-dashboard__section">
          <h2>
            <FontAwesomeIcon icon={faTrophy} />
            <span>PVP 完成率</span>
          </h2>
          <div className="completion-rate-card">
            <div className="completion-rate-card__circle">
              <svg viewBox="0 0 36 36" className="completion-rate-card__svg">
                <path
                  className="completion-rate-card__bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="completion-rate-card__fill"
                  strokeDasharray={`${completionRate || 0}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="completion-rate-card__value">{completionRate || 0}%</div>
            </div>
            <div className="completion-rate-card__label">房间创建到游戏完成的转化率</div>
          </div>
        </section>

        {/* PVP 游戏模式分布 */}
        <section className="admin-dashboard__section">
          <h2>
            <FontAwesomeIcon icon={faChartPie} />
            <span>游戏模式分布</span>
          </h2>
          <div className="distribution-list">
            {gameModeDistribution.length > 0 ? (
              gameModeDistribution.map((item, index) => (
                <div key={index} className="distribution-item">
                  <div className="distribution-item__header">
                    <span className="distribution-item__name">{item.name}</span>
                    <span className="distribution-item__count">{formatNumber(item.count)}</span>
                  </div>
                  <div className="distribution-item__bar">
                    <div
                      className="distribution-item__bar-fill distribution-item__bar-fill--pvp"
                      style={{ width: `${(item.count / modeMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">暂无数据</div>
            )}
          </div>
        </section>

        {/* PVP 相关事件统计 */}
        <section className="admin-dashboard__section">
          <h2>
            <FontAwesomeIcon icon={faUserFriends} />
            <span>PVP 事件统计</span>
          </h2>
          <div className="stats-grid stats-grid--compact">
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('pvp_room_create'))}</div>
                <div className="stat-card__label">创建房间</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('pvp_room_join'))}</div>
                <div className="stat-card__label">加入房间</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('pvp_game_start'))}</div>
                <div className="stat-card__label">开始游戏</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('pvp_game_end'))}</div>
                <div className="stat-card__label">完成游戏</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('pvp_play_again'))}</div>
                <div className="stat-card__label">再来一局</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('pvp_share'))}</div>
                <div className="stat-card__label">PVP分享</div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  // 渲染行为漏斗 Tab
  const renderFunnelTab = () => {
    const { singlePlayer, pvp } = funnelData;

    const renderFunnel = (data, title) => (
      <div className="funnel-chart">
        <h3 className="funnel-chart__title">{title}</h3>
        <div className="funnel-chart__steps">
          {data.map((step, index) => (
            <div key={index} className="funnel-step">
              <div className="funnel-step__bar-container">
                <div
                  className="funnel-step__bar"
                  style={{ width: `${Math.max(step.rate, 10)}%` }}
                >
                  <span className="funnel-step__name">{step.name}</span>
                </div>
              </div>
              <div className="funnel-step__stats">
                <span className="funnel-step__count">{formatNumber(step.count)}</span>
                {index > 0 && (
                  <span className="funnel-step__rate">{step.rate}%</span>
                )}
              </div>
              {index < data.length - 1 && (
                <div className="funnel-step__arrow">↓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <>
        <section className="admin-dashboard__section">
          <h2>
            <FontAwesomeIcon icon={faFilter} />
            <span>用户行为漏斗</span>
          </h2>
          <p className="section-description">
            展示用户从开始到完成各个阶段的转化率
          </p>
        </section>

        <section className="admin-dashboard__section admin-dashboard__section--split">
          <div className="split-panel">
            {renderFunnel(singlePlayer, '单人游戏漏斗')}
          </div>
          <div className="split-panel">
            {renderFunnel(pvp, 'PVP 游戏漏斗')}
          </div>
        </section>
      </>
    );
  };

  // 渲染用户偏好 Tab
  const renderPreferencesTab = () => {
    const { languages } = preferencesData;
    const langMax = getMaxCount(languages);

    return (
      <>
        {/* 语言分布 */}
        <section className="admin-dashboard__section">
          <h2>
            <FontAwesomeIcon icon={faLanguage} />
            <span>语言使用分布</span>
          </h2>
          <div className="distribution-list">
            {languages.length > 0 ? (
              languages.map((item, index) => (
                <div key={index} className="distribution-item">
                  <div className="distribution-item__header">
                    <span className="distribution-item__name">{item.name}</span>
                    <span className="distribution-item__count">{formatNumber(item.count)}</span>
                  </div>
                  <div className="distribution-item__bar">
                    <div
                      className="distribution-item__bar-fill distribution-item__bar-fill--lang"
                      style={{ width: `${(item.count / langMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">暂无语言切换数据</div>
            )}
          </div>
        </section>

        {/* 其他用户交互事件 */}
        <section className="admin-dashboard__section">
          <h2>
            <FontAwesomeIcon icon={faCog} />
            <span>用户交互统计</span>
          </h2>
          <div className="stats-grid stats-grid--compact">
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('setting_change'))}</div>
                <div className="stat-card__label">更改设置</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('language_change'))}</div>
                <div className="stat-card__label">切换语言</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('info_modal_view'))}</div>
                <div className="stat-card__label">查看帮助</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('view_meaning'))}</div>
                <div className="stat-card__label">查看释义</div>
              </div>
            </div>
            <div className="stat-card stat-card--small">
              <div className="stat-card__content">
                <div className="stat-card__value">{formatNumber(getEventCount('game_resume'))}</div>
                <div className="stat-card__label">恢复游戏</div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  // 根据当前 Tab 渲染内容
  const renderTabContent = () => {
    if (!stats) return null;

    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'game':
        return renderGameTab();
      case 'pvp':
        return renderPvpTab();
      case 'funnel':
        return renderFunnelTab();
      case 'preferences':
        return renderPreferencesTab();
      default:
        return renderOverviewTab();
    }
  };

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

        {/* Tab 导航 */}
        <div className="admin-dashboard__tabs">
          {Object.entries(TABS).map(([key, { label, icon }]) => (
            <button
              key={key}
              className={`tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <FontAwesomeIcon icon={icon} />
              <span>{label}</span>
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

        {/* Tab 内容 */}
        {renderTabContent()}
      </main>
    </div>
  );
}

export default AdminDashboard;
