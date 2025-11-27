export const de = {
  home1: "Dieses Spiel ist eine koreanische Version von Wordle",
  home2: "Sollen wir anfangen?",
  home3: "Wählen Sie einen Schwierigkeitsgrad",
  lv1: "Anfänger",
  lv2: "Mittelstufe",
  lv3: "Fortgeschrittene",
  submit: "Einreichen",
  setting: "Einstellungen",
  settings: {
    dark: "Thema",
    theme_light: "Hell",
    theme_dark: "Dunkel",
    theme_system: "System",
    color: "Hochkontrastmodus",
    color_desc: "Genießen Sie das Spiel ohne Farbschranken.",
    keyboard: "Nur Bildschirmeingabe über die Tastatur",
    keyboard_desc:
      "Verwenden Sie nur die auf dem Bildschirm angezeigte Tastatur. Hilft Benutzern von Spracherkennungsgeräten oder Eingabegeräten, das Spiel voll zu genießen.",
  },
  report: "Einen Fehler melden",
  report_desc: "",
  original: "Original Wordle",
  original_desc:
    "Das Original-Wordle-Spiel auf Englisch, zur Verfügung gestellt von der New York Times.",
  link: "Link",
  button: {
    example: "Gemeinsam ausprobieren",
    prev: "Zurück",
    next: "Weiter",
    start: "Spiel starten",
    meaning: "Siehe Wortbedeutung",
    home: "Zuhause",
    back: "Zurückgehen",
  },
  info: {
    header: "Wie man spielt",
    title: "Errate die versteckten Buchstaben (Substantiv) in 6 Versuchen",
    sub_title1: "Farben geben dir Hinweise auf die Antwort.",
    sub_title2:
      "Doppelte Konsonanten und komplexe Vokale nehmen zwei Leerzeichen ein.",
    sub_desc1: "ㅎ ist im Wort und an der richtigen Stelle.",
    sub_desc2: "ㅓ ist im Wort, aber an der falschen Stelle.",
    sub_desc3: "ㄹ steht nicht im Wort.",
    sub_desc4: "ㄲ wird als ㄱㄱ dargestellt.",
    sub_desc5: "ㅘ wird als ㅗㅏ dargestellt.",
  },
  together: {
    title: "Sollen wir es gemeinsam versuchen?",
    desc1: (
      <>
        Dies ist der Startbildschirm. Da es noch keine Hinweise gibt, warum
        nicht irgendein Wort versuchen? Versuchen wir <span>하늘</span>.
      </>
    ),
    desc2: (
      <>
        Wenn die Farben der Kacheln wechseln, erhalten wir mehrere Hinweise.
        <br /> Das heutige Wort enthält nicht <span>ㅎ</span>,<span>ㄴ</span>,
        <span>ㅡ</span>,<span>ㄹ</span>, aber es enthält <span>ㅏ</span>. <br />{" "}
        Welches Wort könnte das sein? <br /> Wie wäre es mit <span>복사</span>?
      </>
    ),
    desc3: (
      <>
        Oh, es ist nicht die richtige Antwort, aber wir haben einen eindeutigen
        Anhaltspunkt. Das heutige Wort endet mit <span>사</span>. Hmm, sollen
        wir <span>경사</span> versuchen?
      </>
    ),
    desc4: (
      <>
        Wir sind der Antwort sehr nahe. Jetzt müssen wir nur noch zwei Steine
        zuordnen. Könnte die Antwort vielleicht <span>검사</span> lauten?
      </>
    ),
    desc5: <>"Richtig!"</>,
    desc6_1: (
      <>
        Wenn Sie auf die Schaltfläche <span>Wortbedeutung sehen</span> klicken,
        nachdem Sie die richtige Antwort gegeben haben, sehen Sie die
        Definitionen des Wortes nur auf Koreanisch, wie unten gezeigt.
      </>
    ),
    desc6_2: (
      <>
        Sollen wir anfangen? <br />
        Klicken Sie unten auf <span>Spiel starten</span>.
      </>
    ),
  },
  answer: {
    msg1: (
      <>
        Erstaunliches Glück!
        <br />
        Sie haben es gleich beim ersten Versuch richtig gemacht!
        <br />
        Hey, könntest du die die Lottozahlen
        <br /> mit mir teilen?😏
      </>
    ),
    msg2: (
      <>
        Fantastisch! Du hast es in nur zwei Versuchen geschafft!
        <br />
        Sie sollten sich überlegen, ein Lotterielos zu kaufen!
        <br />
        (Auch wenn ich dafür nicht verantwortlich gemacht werden kann 😉)
      </>
    ),
    msg3: (
      <>
        Unglaublich! Du hast es in drei Versuchen geschafft.
        <br />
        Ist das Glück? Oder Können?
        <br />
        Oh, Glück ist auch eine Fähigkeit, sagst du?😎
      </>
    ),
    msg4: (
      <>
        Sie haben es beim vierten Versuch geschafft.
        <br />
        Ab jetzt fängt der Spaß erst richtig an, oder?!🤩
      </>
    ),
    msg5: (
      <>
        Sie haben es beim fünften Versuch geschafft.
        <br />
        Du scheinst nicht sehr entspannt zu sein...
        <br />
        Du hast dich nicht angespannt gefühlt, sagst du? Wirklich?🤨
      </>
    ),
    msg6: (
      <>
        Puh,
        <br />
        Du hast deine letzte Chance nicht verpasst!
        <br />
        Erfolg!🤗
      </>
    ),
  },
  failed: "So nah! Versuchen Sie es noch einmal!😔",
  share: {
    button: "Teilen",
    copied: "Kopiert!",
    attempts: "Versuche",
    answer: "Antwort",
  },
  center_msg: {
    lack: "Nicht genug Buchstaben.",
    much: "Input exceeds limit.",
    wrong: "Kein gültiges Substantiv.",
    play_block:
      "Sie befinden sich bereits in einem Spiel. Bitte drücken Sie die Schaltfläche Schließen.",
  },
  notfound: {
    title: "Seite nicht gefunden",
    content:
      "Die gesuchte Seite existiert nicht. Überprüfen Sie die URL oder kehren Sie zur Startseite zurück.",
    button: "Zur Startseite",
  },
  resume: {
    title: "Unvollständiges Spiel gefunden",
    desc: "Möchten Sie Ihr vorheriges Spiel fortsetzen?",
    continue: "Fortsetzen",
    newGame: "Neues Spiel",
  },
  pvp: {
    title: "PVP-Kampf",
    desc: "Treten Sie gegen Freunde an und sehen Sie, wer am schnellsten rät!",
    create_room: "Raum erstellen",
    join_room: "Raum beitreten",
    nickname: "Spitzname",
    nickname_placeholder: "Geben Sie Ihren Spitznamen ein",
    difficulty: "Schwierigkeit",
    game_mode: "Spielmodus",
    mode_race: "Rennen-Modus",
    mode_race_desc: "Erster gewinnt",
    mode_timed: "Zeitlimit-Modus",
    mode_timed_desc: "Mehr lösen gewinnt",
    time_limit: "Zeitlimit",
    minutes: "Min",
    room_code: "Raumcode",
    room_code_placeholder: "6-stelligen Raumcode eingeben",
    create: "Erstellen",
    join: "Beitreten",
    connecting: "Verbindung zum Server wird hergestellt...",
    waiting_room: "Warteraum",
    copy_code: "Raumcode kopieren",
    copy_link: "Einladungslink kopieren",
    players: "Spieler",
    you: "Du",
    ready: "Bereit",
    not_ready: "Nicht bereit",
    ready_up: "Bereit machen",
    cancel_ready: "Bereit abbrechen",
    start_game: "Spiel starten",
    waiting_players: "Warten auf alle Spieler...",
    need_more_players: "Mindestens 2 Spieler erforderlich",
    leave: "Raum verlassen",
    game_over: "Spiel beendet",
    attempts: "Versuche",
    failed: "Gescheitert",
    answer_was: "Die Antwort war",
    play_again: "Nochmal spielen",
    wait_host: "Warten auf Host für nächste Runde...",
    solved: "Gelöst",
    questions: "gelöst",
    time_up: "Zeit abgelaufen!",
    correct_letters: "richtig",
    opponents_left: "Gegner haben den Raum verlassen",
    edit_settings: "Einstellungen ändern",
    room_settings: "Raumeinstellungen",
    settings_notice: "Nach Änderungen müssen andere Spieler erneut bereit sein",
    cancel: "Abbrechen",
    save: "Speichern",
    errors: {
      connection_failed: "Serververbindung fehlgeschlagen, bitte erneut versuchen",
      room_not_found: "Raum nicht gefunden oder wurde geschlossen",
      room_full: "Raum ist voll",
      game_started: "Spiel hat bereits begonnen",
      room_expired: "Raum ist abgelaufen",
      name_required: "Bitte Spitznamen eingeben",
      invalid_code: "Bitte 6-stelligen Raumcode eingeben",
      unknown: "Ein unbekannter Fehler ist aufgetreten",
    },
  },
};
