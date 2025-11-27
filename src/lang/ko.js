export const ko = {
  home1: "이 게임은 Wordle의 한글 변형판입니다",
  home2: "시작해볼까요?",
  home3: "난이도를 선택하세요",
  lv1: "초급",
  lv2: "중급",
  lv3: "고급",
  mode6: {
    title: "6글자 모드",
    imdt: "중급",
    hard: "고급",
  },
  submit: "제출",
  setting: "설정",
  settings: {
    dark: "테마",
    theme_light: "라이트",
    theme_dark: "다크",
    theme_system: "시스템",
    color: "고대비 모드",
    color_desc:
      "색 구별에 불편함이 있는 사용자가 색을 더 명확하게 인식할 수 있도록 도와줍니다.",
    keyboard: "화면 키보드 입력만 사용",
    keyboard_desc:
      "화면에 제공된 키보드만 사용할 수 있도록 합니다. 음성 인식이나 입력 보조 장치의 사용자가 온전히 게임을 즐길 수 있도록 도와줍니다.",
  },
  report: "버그 신고",
  report_desc: "",
  original: "Original Wordle",
  original_desc:
    "뉴욕 타임즈가 제공하고 있는 영문판 오리지널 Wordle 게임입니다.",
  link: "바로가기",
  button: {
    example: "함께 해보기",
    prev: "이전",
    next: "다음",
    start: "게임 시작",
    meaning: "단어 뜻 보기",
    home: "홈으로",
    back: "뒤로 가기",
  },
  info: {
    header: "게임하는 방법",
    title: "6번 시도해서 숨겨진 글자(명사)를 맞춰보세요",
    sub_title1: "색상은 정답의 단서가 됩니다.",
    sub_title2: "겹자모는 두 칸을 활용합니다.",
    sub_desc1: "ㅎ은 단어 안에 있고, 정확한 위치에 있습니다.",
    sub_desc2: "ㅓ는 단어 안에 있지만, 잘못된 위치에 있습니다.",
    sub_desc3: "ㄹ은 단어에 포함되지 않습니다.",
    sub_desc4: "ㄲ은 ㄱㄱ으로 표기합니다.",
    sub_desc5: "ㅘ는 ㅗㅏ로 표기합니다.",
  },
  together: {
    title: "함께 해볼까요?",
    desc1: (
      <>
        처음 시작화면입니다. 지금은 아무 단서가 없으니 아무 단어나 써볼까요?{" "}
        <span>하늘</span>을 써보겠습니다.
      </>
    ),
    desc2: (
      <>
        타일색이 변경되면서 여러 단서가 나왔어요.
        <br /> 오늘의 단어는 <span>ㅎ</span>,<span>ㄴ</span>,<span>ㅡ</span>,
        <span>ㄹ</span>를 포함하지 않고, <span>ㅏ</span>를 포함하고 있네요. 그런
        단어가 뭐가 있을까요? <span>복사</span>는 어떨까요?
      </>
    ),
    desc3: (
      <>
        {" "}
        이런, 정답은 아니지만 확실한 단서를 얻었어요. 오늘의 단어는{" "}
        <span>사</span>로 끝나는 단어였군요. <br />
        음, <span>경사</span>로 한 번 시도해 볼까요?
      </>
    ),
    desc4: (
      <>
        정답에 근접했습니다. 이제 두 타일만 맞추면 됩니다. 혹시 답은{" "}
        <span>검사</span>가 아닐까요?
      </>
    ),
    desc5: <>"정답!"</>,
    desc6_1: (
      <>
        정답을 맞춘 뒤 나오는 <br />
        <span>단어 뜻 보기</span> 버튼을 누르면, <br />
        단어의 뜻을 아래와 같이 확인할 수 있습니다.
      </>
    ),
    desc6_2: (
      <>
        자, 그럼 게임을 시작해볼까요? <br /> 아래의 <span>게임 시작</span>{" "}
        버튼을 눌러보세요.
      </>
    ),
  },
  answer: {
    msg1: (
      <>
        대단한 운!
        <br />
        첫 시도에 바로 맞추셨어요!
        <br />
        저기, 혹시 복권 번호 좀 알려줄래요?😏
      </>
    ),
    msg2: (
      <>
        굉장합니다! 단 두 번만에 성공!
        <br />
        복권 구매를 고려해 보는 건 어떨까요?
        <br />
        (물론 저는 책임지지 않을 겁니다만 😉)
      </>
    ),
    msg3: (
      <>
        놀라워요! 세 번만에 맞췄어요.
        <br />
        운인가요? 실력인가요?
        <br />
        아, 운도 실력이라고요?😎
      </>
    ),
    msg4: (
      <>
        네 번째 시도에 성공하셨군요.
        <br />
        진짜 재미는 네 번째부터죠!🤩
      </>
    ),
    msg5: (
      <>
        다섯 번째 시도에 성공하셨군요.
        <br />
        표정이 여유로워 보이진 않는데...
        <br />
        긴장 안 했다고요? 정말?🤨
      </>
    ),
    msg6: (
      <>
        휴
        <br />
        마지막 기회를 놓치지 않으셨군요!
        <br />
        성공!🤗
      </>
    ),
  },
  failed: "아쉬워요! 다시 도전해보세요!😔",
  share: {
    button: "공유",
    copied: "복사됨!",
    attempts: "번 시도",
    answer: "정답",
  },
  center_msg: {
    lack: "글자 수가 충분하지 않습니다.",
    much: "입력값을 초과했습니다.",
    wrong: "정확한 명사가 아닙니다.",
    play_block: "이미 게임을 실행하고 있습니다. 닫기 버튼을 눌러주세요.",
  },
  notfound: {
    title: "페이지를 찾을 수 없습니다",
    content: "찾고 있는 페이지가 존재하지 않습니다. URL을 확인하거나 홈으로 돌아가세요.",
    button: "홈으로 이동",
  },
  resume: {
    title: "완료되지 않은 게임이 있습니다",
    desc: "이전 게임을 계속하시겠습니까?",
    continue: "계속하기",
    newGame: "새 게임",
  },
  pvp: {
    title: "PVP 대전",
    desc: "친구들과 함께 겨루며 누가 더 빨리 맞추는지 확인하세요!",
    create_room: "방 만들기",
    join_room: "방 참가",
    nickname: "닉네임",
    nickname_placeholder: "닉네임을 입력하세요",
    difficulty: "난이도",
    game_mode: "게임 모드",
    mode_race: "스피드 모드",
    mode_race_desc: "먼저 맞추면 승리",
    mode_timed: "타임어택 모드",
    mode_timed_desc: "더 많이 맞추면 승리",
    time_limit: "제한 시간",
    minutes: "분",
    room_code: "방 코드",
    room_code_placeholder: "6자리 방 코드를 입력하세요",
    create: "만들기",
    join: "참가",
    connecting: "서버에 연결 중...",
    waiting_room: "대기실",
    copy_code: "방 코드 복사",
    copy_link: "초대 링크 복사",
    players: "플레이어",
    you: "나",
    ready: "준비완료",
    not_ready: "대기 중",
    ready_up: "준비",
    cancel_ready: "준비 취소",
    start_game: "게임 시작",
    waiting_players: "모든 플레이어가 준비할 때까지 기다리는 중...",
    need_more_players: "최소 2명의 플레이어가 필요합니다",
    leave: "방 나가기",
    game_over: "게임 종료",
    attempts: "번 시도",
    failed: "실패",
    answer_was: "정답은",
    play_again: "다시 하기",
    wait_host: "호스트가 다음 라운드를 시작할 때까지 기다리세요...",
    solved: "클리어",
    questions: "문제",
    time_up: "시간 종료!",
    correct_letters: "정답",
    opponents_left: "상대방이 나가서 게임이 조기 종료되었습니다",
    edit_settings: "설정 변경",
    room_settings: "방 설정",
    settings_notice: "설정 변경 후 다른 플레이어는 다시 준비해야 합니다",
    cancel: "취소",
    save: "저장",
    errors: {
      connection_failed: "서버 연결에 실패했습니다. 다시 시도해 주세요",
      room_not_found: "방을 찾을 수 없거나 닫혔습니다",
      room_full: "방이 가득 찼습니다",
      game_started: "게임이 이미 시작되었습니다",
      room_expired: "방이 만료되었습니다",
      name_required: "닉네임을 입력해 주세요",
      invalid_code: "6자리 방 코드를 입력해 주세요",
      unknown: "알 수 없는 오류가 발생했습니다",
    },
  },
};
