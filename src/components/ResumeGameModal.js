import "@styles/components/_modal.scss";
import { useLanguage } from "@contexts/LanguageContext";

const ResumeGameModal = ({ onResume, onNewGame }) => {
  const { lang } = useLanguage();

  return (
    <div className="Overlay">
      <div className="Content">
        <div className="content_txt">
          <p>{lang.resume?.title || "发现未完成的游戏"}</p>
          <p className="content_txt__desc">
            {lang.resume?.desc || "是否继续之前的游戏？"}
          </p>
        </div>
        <div className="Buttons">
          <button className="HomeButton" onClick={onResume}>
            {lang.resume?.continue || "继续游戏"}
          </button>
          <button className="HomeButton" onClick={onNewGame}>
            {lang.resume?.newGame || "新游戏"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeGameModal;
