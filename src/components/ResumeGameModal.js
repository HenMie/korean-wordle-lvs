import "@styles/components/_modal.scss";
import { useLanguage } from "@contexts/LanguageContext";

const ResumeGameModal = ({ onResume, onNewGame }) => {
  const { lang } = useLanguage();

  return (
    <div className="Overlay">
      <div className="Content">
        <div className="content_txt">
          <p>{lang.resume?.title || "发现未完成的游戏"}</p>
          <p style={{ fontSize: "0.9em", marginTop: "10px", color: "#666" }}>
            {lang.resume?.desc || "是否继续之前的游戏？"}
          </p>
        </div>
        <div className="Buttons">
          <div className="HomeButton" onClick={onResume}>
            {lang.resume?.continue || "继续游戏"}
          </div>
          <div className="HomeButton" onClick={onNewGame}>
            {lang.resume?.newGame || "新游戏"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeGameModal;

