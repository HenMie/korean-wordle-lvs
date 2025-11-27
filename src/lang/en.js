export const en = {
  home1: "This game is a Korean version of Wordle",
  home2: "Shall we start?",
  home3: "Select a dificulty level",
  lv1: "Beginner",
  lv2: "Intermediate",
  lv3: "Advanced",
  mode6: {
    title: "6-Letter Mode",
    imdt: "Intermediate",
    hard: "Advanced",
  },
  submit: "Submit",
  setting: "Settings",
  settings: {
    dark: "Theme",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_system: "System",
    color: "High Contrast Mode",
    color_desc: "Enjoy the game without color barriers.",
    keyboard: "Onscreen Keyboard Input Only",
    keyboard_desc:
      "Only use the keyboard provided on the screen. Helps voice recognition users or input assist device users fully enjoy the game.",
  },
  report: "Report a bug",
  report_desc: "",
  original: "Original Wordle",
  original_desc:
    "The original Wordle game in English, provided by The New York Times.",
  link: "Link",
  button: {
    example: "Try it together",
    prev: "Prev",
    next: "Next",
    start: "Start Game",
    meaning: "See Word Meaning",
    home: "Home",
    back: "Go Back",
  },
  info: {
    header: "How to Play",
    title: "Guess the hidden letters (noun) in 6 tries",
    sub_title1: "Colors will give you clues about the answer.",
    sub_title2: "Double consonant and complex vowels take up two spaces.",
    sub_desc1: "ㅎ is in the word and in the correct position.",
    sub_desc2: "ㅓ is in the word but in the wrong position.",
    sub_desc3: "ㄹ is not in the word.",
    sub_desc4: "ㄲ is represented as ㄱㄱ.",
    sub_desc5: "ㅘ is represented as ㅗㅏ.",
  },
  together: {
    title: "Shall We Try Together?",
    desc1: (
      <>
        This is the start screen. Since there are no clues yet, why not try any
        word? Let's try <span>하늘</span>.
      </>
    ),
    desc2: (
      <>
        As the tile colors change, we get several clues.
        <br /> Today's word does not include <span>ㅎ</span>,<span>ㄴ</span>,
        <span>ㅡ</span>,<span>ㄹ</span>, but it does include <span>ㅏ</span>.{" "}
        <br /> What word could that be? <br /> How about <span>복사</span>?
      </>
    ),
    desc3: (
      <>
        Oh, it's not the correct answer, but we've got a definite clue. Today's
        word ends with <span>사</span>. <br />
        Hmm, shall we try <span>경사</span>?
      </>
    ),
    desc4: (
      <>
        We're close to the answer. Now we only need to match two tiles. Could
        the answer possibly be <span>검사</span>?
      </>
    ),
    desc5: <>"Correct!"</>,
    desc6_1: (
      <>
        If you click the <span>See Word Meaning</span> button after you've
        answered correctly, you'll see the definitions of the word only in
        Korean as shown below.
      </>
    ),
    desc6_2: (
      <>
        Shall we start? <br /> Click the <span>Start Game</span> below.
      </>
    ),
  },
  answer: {
    msg1: (
      <>
        Amazing luck!
        <br />
        You got it right on the first try!
        <br />
        Hey, could you share <br />
        the lottery numbers with me?😏
      </>
    ),
    msg2: (
      <>
        Fantastic! You succeeded in just two tries!
        <br />
        Maybe consider buying a lottery ticket?
        <br />
        (Though I won't be held responsible 😉)
      </>
    ),
    msg3: (
      <>
        Incredible! Got it in three tries.
        <br />
        Is it luck? Or skill?
        <br />
        Oh, luck is a skill too, you say?😎
      </>
    ),
    msg4: (
      <>
        You succeeded on the fourth try.
        <br />
        The real fun starts from now on, right?!🤩
      </>
    ),
    msg5: (
      <>
        You succeeded on the fifth try.
        <br />
        You don’t seem too relaxed...
        <br />
        Didn’t feel tense, you say? Really?🤨
      </>
    ),
    msg6: (
      <>
        Phew
        <br />
        You didn’t miss your last chance!
        <br />
        Success!🤗
      </>
    ),
  },
  failed: "So close! Give it another shot!😔",
  share: {
    button: "Share",
    copied: "Copied!",
    attempts: "attempts",
    answer: "Answer",
  },
  center_msg: {
    lack: "Not enough letters.",
    much: "Input exceeds limit.",
    wrong: "Not a valid noun.",
    play_block:
      "You are already playing a game. Please press the close button.",
  },
  notfound: {
    title: "Page Not Found",
    content: "The page you're looking for doesn't exist. Check the URL or return to the home page.",
    button: "Go to Home",
  },
  resume: {
    title: "Unfinished Game Found",
    desc: "Would you like to continue your previous game?",
    continue: "Continue",
    newGame: "New Game",
  },
  pvp: {
    title: "PVP Battle",
    desc: "Compete with friends and see who guesses fastest!",
    create_room: "Create Room",
    join_room: "Join Room",
    nickname: "Nickname",
    nickname_placeholder: "Enter your nickname",
    difficulty: "Difficulty",
    game_mode: "Game Mode",
    mode_race: "Race Mode",
    mode_race_desc: "First to solve wins",
    mode_timed: "Timed Mode",
    mode_timed_desc: "Solve more to win",
    time_limit: "Time Limit",
    minutes: "min",
    room_code: "Room Code",
    room_code_placeholder: "Enter 6-digit room code",
    create: "Create",
    join: "Join",
    connecting: "Connecting to server...",
    waiting_room: "Waiting Room",
    copy_code: "Copy Room Code",
    copy_link: "Copy Invite Link",
    players: "Players",
    you: "You",
    ready: "Ready",
    not_ready: "Not Ready",
    ready_up: "Ready Up",
    cancel_ready: "Cancel Ready",
    start_game: "Start Game",
    waiting_players: "Waiting for all players to be ready...",
    need_more_players: "At least 2 players needed",
    leave: "Leave Room",
    game_over: "Game Over",
    attempts: "attempts",
    failed: "Failed",
    answer_was: "The answer was",
    play_again: "Play Again",
    wait_host: "Waiting for host to start next round...",
    solved: "Solved",
    questions: "solved",
    time_up: "Time's up!",
    correct_letters: "correct",
    opponents_left: "Opponents left, game ended early",
    edit_settings: "Edit Settings",
    room_settings: "Room Settings",
    settings_notice: "Other players need to ready up again after changes",
    cancel: "Cancel",
    save: "Save",
    errors: {
      connection_failed: "Failed to connect to server, please try again",
      room_not_found: "Room not found or has been closed",
      room_full: "Room is full",
      game_started: "Game has already started",
      room_expired: "Room has expired",
      name_required: "Please enter a nickname",
      invalid_code: "Please enter a 6-digit room code",
      unknown: "An unknown error occurred",
    },
  },
};
