export const zh = {
  home1: "这是 Wordle 的韩语版本",
  home2: "开始吧？",
  home3: "选择难度级别",
  lv1: "初级",
  lv2: "中级",
  lv3: "高级",
  mode6: {
    title: "6字模式",
    imdt: "中级",
    hard: "高级",
  },
  submit: "提交",
  setting: "设置",
  settings: {
    dark: "主题",
    theme_light: "浅色",
    theme_dark: "深色",
    theme_system: "跟随系统",
    color: "高对比度模式",
    color_desc: "帮助色觉障碍用户更清晰地识别颜色。",
    keyboard: "仅使用屏幕键盘",
    keyboard_desc:
      "仅使用屏幕上提供的键盘。帮助语音识别或辅助输入设备用户更好地享受游戏。",
  },
  report: "报告错误",
  report_desc: "",
  original: "原版 Wordle",
  original_desc: "纽约时报提供的英文原版 Wordle 游戏。",
  link: "链接",
  button: {
    example: "一起试试",
    prev: "上一步",
    next: "下一步",
    start: "开始游戏",
    meaning: "查看词义",
    home: "首页",
    back: "返回",
  },
  info: {
    header: "游戏规则",
    title: "在6次尝试内猜出隐藏的字母（名词）",
    sub_title1: "颜色将为您提供答案线索。",
    sub_title2: "双辅音和复合元音占两格。",
    sub_desc1: "ㅎ 在单词中且位置正确。",
    sub_desc2: "ㅓ 在单词中但位置错误。",
    sub_desc3: "ㄹ 不在单词中。",
    sub_desc4: "ㄲ 表示为 ㄱㄱ。",
    sub_desc5: "ㅘ 表示为 ㅗㅏ。",
  },
  together: {
    title: "一起来试试吧？",
    desc1: (
      <>
        这是初始界面。现在没有任何线索，随便试一个词吧？我们来试试{" "}
        <span>하늘</span>。
      </>
    ),
    desc2: (
      <>
        方块颜色改变后，出现了一些线索。
        <br /> 今天的单词不包含 <span>ㅎ</span>、<span>ㄴ</span>、<span>ㅡ</span>、
        <span>ㄹ</span>，但包含 <span>ㅏ</span>。会是什么单词呢？试试{" "}
        <span>복사</span> 怎么样？
      </>
    ),
    desc3: (
      <>
        虽然不是正确答案，但我们得到了确切线索。今天的单词以 <span>사</span>{" "}
        结尾。
        <br />
        嗯，试试 <span>경사</span> 吧？
      </>
    ),
    desc4: (
      <>
        接近答案了。现在只需要匹配两个方块。答案会不会是 <span>검사</span>？
      </>
    ),
    desc5: <>"正确！"</>,
    desc6_1: (
      <>
        答对后点击 <span>查看词义</span> 按钮，
        <br />
        可以看到该词的韩语释义，如下所示。
      </>
    ),
    desc6_2: (
      <>
        那么，开始游戏吧？
        <br /> 点击下方的 <span>开始游戏</span> 按钮。
      </>
    ),
  },
  answer: {
    msg1: (
      <>
        运气太好了！
        <br />
        第一次就猜对了！
        <br />
        能告诉我彩票号码吗？😏
      </>
    ),
    msg2: (
      <>
        太厉害了！只用两次就成功了！
        <br />
        要不要考虑买张彩票？
        <br />
        （当然我不负责哦 😉）
      </>
    ),
    msg3: (
      <>
        太棒了！三次就猜中了。
        <br />
        是运气？还是实力？
        <br />
        哦，运气也是实力？😎
      </>
    ),
    msg4: (
      <>
        第四次尝试成功了。
        <br />
        真正的乐趣才刚开始！🤩
      </>
    ),
    msg5: (
      <>
        第五次尝试成功了。
        <br />
        表情看起来不太轻松...
        <br />
        说不紧张？真的吗？🤨
      </>
    ),
    msg6: (
      <>
        呼
        <br />
        没有错过最后的机会！
        <br />
        成功！🤗
      </>
    ),
  },
  failed: "好可惜！再试一次吧！😔",
  share: {
    button: "分享",
    copied: "已复制!",
    attempts: "次尝试",
    answer: "正确答案",
  },
  center_msg: {
    lack: "字母数量不足。",
    much: "超出输入限制。",
    wrong: "不是有效的名词。",
    play_block: "游戏已在进行中。请点击关闭按钮。",
  },
  notfound: {
    title: "页面未找到",
    content: "您查找的页面不存在。请检查网址或返回首页。",
    button: "返回首页",
  },
  resume: {
    title: "发现未完成的游戏",
    desc: "是否继续之前的游戏？",
    continue: "继续游戏",
    newGame: "新游戏",
  },
  pvp: {
    title: "PVP 对战",
    desc: "与好友一起比拼，看谁猜得更快！",
    create_room: "创建房间",
    join_room: "加入房间",
    nickname: "昵称",
    nickname_placeholder: "输入你的昵称",
    difficulty: "难度",
    game_mode: "游戏模式",
    mode_race: "竞速模式",
    mode_race_desc: "先猜出者获胜",
    mode_timed: "限时模式",
    mode_timed_desc: "猜更多题目获胜",
    time_limit: "时间限制",
    minutes: "分钟",
    room_code: "房间码",
    room_code_placeholder: "输入6位数字房间码",
    create: "创建",
    join: "加入",
    connecting: "正在连接服务器...",
    waiting_room: "等待室",
    copy_code: "复制房间码",
    copy_link: "复制邀请链接",
    players: "玩家",
    you: "你",
    ready: "已准备",
    not_ready: "未准备",
    ready_up: "准备",
    cancel_ready: "取消准备",
    start_game: "开始游戏",
    waiting_players: "等待所有玩家准备...",
    need_more_players: "至少需要2名玩家",
    leave: "离开房间",
    game_over: "游戏结束",
    attempts: "次",
    failed: "未猜出",
    answer_was: "正确答案",
    play_again: "再来一局",
    wait_host: "等待房主开始下一局...",
    solved: "已解",
    questions: "题",
    time_up: "时间到！",
    correct_letters: "正确",
    opponents_left: "对手已离开，游戏提前结束",
    edit_settings: "修改设置",
    room_settings: "房间设置",
    settings_notice: "修改设置后，其他玩家需要重新准备",
    cancel: "取消",
    save: "保存",
    errors: {
      connection_failed: "连接服务器失败，请稍后重试",
      room_not_found: "房间不存在或已关闭",
      room_full: "房间已满",
      game_started: "游戏已开始，无法加入",
      room_expired: "房间已过期",
      name_required: "请输入昵称",
      invalid_code: "请输入6位房间码",
      unknown: "发生未知错误",
    },
  },
};

