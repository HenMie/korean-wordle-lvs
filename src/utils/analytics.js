/**
 * Umami Analytics 统计工具模块
 * 
 * 使用方法:
 * import { trackEvent, trackGameStart, trackGameEnd, ... } from '@utils/analytics';
 */

// 检查 umami 是否可用
const isUmamiAvailable = () => {
  return typeof window !== 'undefined' && typeof window.umami !== 'undefined';
};

/**
 * 通用事件追踪
 * @param {string} eventName - 事件名称
 * @param {object} data - 事件数据
 */
export const trackEvent = (eventName, data = {}) => {
  if (!isUmamiAvailable()) {
    // 开发环境下打印日志
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, data);
    }
    return;
  }

  try {
    window.umami.track(eventName, data);
  } catch (error) {
    console.error('[Analytics] Track event error:', error);
  }
};

// ============================================
// 单人游戏事件
// ============================================

/**
 * 追踪游戏开始
 * @param {string} mode - 难度模式 (easy/imdt/hard)
 * @param {number} wordLength - 字数 (5/6)
 */
export const trackGameStart = (mode, wordLength = 5) => {
  trackEvent('game_start', {
    mode,
    wordLength,
  });
};

/**
 * 追踪游戏结束
 * @param {string} mode - 难度模式
 * @param {number} wordLength - 字数
 * @param {boolean} won - 是否获胜
 * @param {number} attempts - 猜测次数
 */
export const trackGameEnd = (mode, wordLength, won, attempts) => {
  trackEvent('game_end', {
    mode,
    wordLength,
    result: won ? 'win' : 'lose',
    attempts,
  });
};

/**
 * 追踪猜测提交
 * @param {string} mode - 难度模式
 * @param {number} wordLength - 字数
 * @param {number} attemptNumber - 第几次猜测
 */
export const trackGuessSubmit = (mode, wordLength, attemptNumber) => {
  trackEvent('guess_submit', {
    mode,
    wordLength,
    attemptNumber,
  });
};

// ============================================
// PVP 游戏事件
// ============================================

/**
 * 追踪创建 PVP 房间
 * @param {object} options - 房间配置
 */
export const trackPvpRoomCreate = ({ gameMode, wordLength, difficulty, timeLimit }) => {
  trackEvent('pvp_room_create', {
    gameMode,
    wordLength,
    difficulty,
    timeLimit: timeLimit || null,
  });
};

/**
 * 追踪加入 PVP 房间
 * @param {number} wordLength - 字数
 * @param {string} difficulty - 难度
 */
export const trackPvpRoomJoin = (wordLength, difficulty) => {
  trackEvent('pvp_room_join', {
    wordLength,
    difficulty,
  });
};

/**
 * 追踪 PVP 游戏开始
 * @param {object} options - 游戏配置
 */
export const trackPvpGameStart = ({ gameMode, wordLength, difficulty, playerCount }) => {
  trackEvent('pvp_game_start', {
    gameMode,
    wordLength,
    difficulty,
    playerCount,
  });
};

/**
 * 追踪 PVP 游戏结束
 * @param {object} options - 游戏结果
 */
export const trackPvpGameEnd = ({ gameMode, wordLength, result, rank, playerCount, solvedCount }) => {
  trackEvent('pvp_game_end', {
    gameMode,
    wordLength,
    result,
    rank,
    playerCount,
    solvedCount: solvedCount || null,
  });
};

// ============================================
// 用户设置事件
// ============================================

/**
 * 追踪设置变更
 * @param {string} setting - 设置项名称
 * @param {string|boolean} value - 设置值
 */
export const trackSettingChange = (setting, value) => {
  trackEvent('setting_change', {
    setting,
    value: String(value),
  });
};

/**
 * 追踪语言切换
 * @param {string} language - 语言代码
 */
export const trackLanguageChange = (language) => {
  trackEvent('language_change', {
    language,
  });
};

// ============================================
// 页面访问事件（可选，Umami 自动追踪页面）
// ============================================

/**
 * 追踪页面访问（用于 SPA 手动追踪）
 * @param {string} url - 页面 URL
 * @param {string} title - 页面标题
 */
export const trackPageView = (url, title) => {
  if (!isUmamiAvailable()) return;

  try {
    window.umami.track((props) => ({
      ...props,
      url,
      title,
    }));
  } catch (error) {
    console.error('[Analytics] Track page view error:', error);
  }
};

const analytics = {
  trackEvent,
  trackGameStart,
  trackGameEnd,
  trackGuessSubmit,
  trackPvpRoomCreate,
  trackPvpRoomJoin,
  trackPvpGameStart,
  trackPvpGameEnd,
  trackSettingChange,
  trackLanguageChange,
  trackPageView,
};

export default analytics;

