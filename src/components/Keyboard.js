import { useCallback, useEffect, useState } from "react";
import { Box } from "@mui/material";
import buttonsData from "@assets/buttons-kor.json";
import { useLanguage } from "@contexts/LanguageContext";
import { useRecoilValue } from "recoil";
import { keyboardModeState } from "@state/themeState";

const Keyboard = ({
  pred,
  setPred,
  gotAnswer,
  listLen,
  showMessage,
  handleSubmitButtonClick,
}) => {
  const { lang } = useLanguage();
  const [animatedButton, setAnimatedButton] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  const myButtons1 = buttonsData.myButtons1;
  const myButtons2 = buttonsData.myButtons2;
  const myButtons3 = buttonsData.myButtons3;
  const muchMessage = lang?.center_msg?.much ?? "";

  const animationBtn = useCallback((value) => {
    setAnimatedButton(value);
    setAnimationKey((prevKey) => prevKey + 1);
  }, []);

  const handleRemoveButtonClick = useCallback(() => {
    setPred((prevPred) => {
      if (!prevPred.length || !prevPred[prevPred.length - 1]?.deletable) {
        return prevPred;
      }

      return prevPred.slice(0, -1);
    });
  }, [setPred]);

  const handleButtonClick = useCallback(
    (value) => {
      animationBtn(value);

      setPred((prevPred) => {
        if (prevPred.length >= listLen) {
          showMessage(muchMessage);
          return prevPred;
        }

        const newItem = {
          value,
          deletable: true,
          color: "",
        };

        return [...prevPred, newItem];
      });
    },
    [animationBtn, listLen, showMessage, muchMessage, setPred]
  );

  // Real Keyboard input
  const keyboardMode = useRecoilValue(keyboardModeState);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Keyboard Mode
      if (!!keyboardMode) {
        return;
      }

      const keyToHangul = {
        q: "ㅂ",
        w: "ㅈ",
        e: "ㄷ",
        r: "ㄱ",
        t: "ㅅ",
        a: "ㅁ",
        s: "ㄴ",
        d: "ㅇ",
        f: "ㄹ",
        g: "ㅎ",
        z: "ㅋ",
        x: "ㅌ",
        c: "ㅊ",
        v: "ㅍ",
        b: "ㅠ",
        y: "ㅛ",
        u: "ㅕ",
        i: "ㅑ",
        o: "ㅐ",
        p: "ㅔ",
        h: "ㅗ",
        j: "ㅓ",
        k: "ㅏ",
        l: "ㅣ",
        n: "ㅜ",
        m: "ㅡ",
      };
      const key = event.key.toLowerCase();

      if (key === "enter") {
        animationBtn("enter");
        handleSubmitButtonClick();
      } else if (key === "backspace") {
        animationBtn("backspace");
        handleRemoveButtonClick();
      } else {
        const hangul = keyToHangul[key];
        if (hangul) {
          handleButtonClick(hangul);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    keyboardMode,
    animationBtn,
    handleButtonClick,
    handleRemoveButtonClick,
    handleSubmitButtonClick,
  ]);

  useEffect(() => {
    if (animatedButton !== null) {
      const timer = setTimeout(() => {
        setAnimatedButton(null);
      }, 300); // CSS 애니메이션 지속 시간과 일치

      return () => clearTimeout(timer);
    }
  }, [animatedButton, animationKey]);

  // function keyboardColor(v) {
  //   const foundPreds = pred.filter((predItem) => predItem.value === v);

  //   if (foundPreds.some((predItem) => predItem.color === "green")) {
  //     return "green";
  //   }
  //   if (foundPreds.some((predItem) => predItem.color === "yellow")) {
  //     return "yellow";
  //   }
  //   if (foundPreds.some((predItem) => predItem.color === "gray")) {
  //     return "gray";
  //   }
  //   return "";
  // }

  function keyboardColor(value) {
    const colors = ["green", "yellow", "gray"];

    for (const color of colors) {
      if (
        pred.some(
          (predItem) => predItem.value === value && predItem.color === color
        )
      ) {
        return color;
      }
    }
    return "";
  }

  return (
    <Box className="keyboard">
      <Box className="raw1">
        {myButtons1.map((button) => (
          <button
            key={button.id}
            onClick={(event) => {
              handleButtonClick(button.value);
              event.currentTarget.blur();
            }}
            value={button.value}
            className={`${keyboardColor(button.value)} ${
              animatedButton === button.value ? "animate-button" : ""
            }`}
            style={{ animationIterationCount: animationKey }}
            disabled={gotAnswer}
          >
            {button.value}
          </button>
        ))}
      </Box>
      <Box className="raw2">
        {myButtons2.map((button) => (
          <button
            key={button.id}
            onClick={(event) => {
              handleButtonClick(button.value);
              event.currentTarget.blur();
            }}
            value={button.value}
            className={`${keyboardColor(button.value)} ${
              animatedButton === button.value ? "animate-button" : ""
            }`}
            style={{ animationIterationCount: animationKey }}
            disabled={gotAnswer}
          >
            {button.value}
          </button>
        ))}
      </Box>
      <Box className="raw3">
        <button
          className={`submit__btn ${
            animatedButton === "enter" ? "animate-button" : ""
          }`}
          onClick={(event) => {
            handleSubmitButtonClick();
            event.currentTarget.blur();
            animationBtn("enter");
          }}
          disabled={gotAnswer}
        >
          {lang.submit}
        </button>
        {myButtons3.map((button) => (
          <button
            key={button.id}
            onClick={(event) => {
              handleButtonClick(button.value);
              event.currentTarget.blur();
            }}
            value={button.value}
            className={`${keyboardColor(button.value)} ${
              animatedButton === button.value ? "animate-button" : ""
            }`}
            style={{ animationIterationCount: animationKey }}
            disabled={gotAnswer}
          >
            {button.value}
          </button>
        ))}
        <button
          className={`remove_btn ${
            animatedButton === "backspace" ? "animate-button" : ""
          }`}
          onClick={(event) => {
            handleRemoveButtonClick();
            event.currentTarget.blur();
            animationBtn("backspace");
          }}
          disabled={gotAnswer}
        >
          ⌫
        </button>
      </Box>
    </Box>
  );
};

export default Keyboard;
