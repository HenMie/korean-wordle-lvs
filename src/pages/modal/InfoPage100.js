import { useLanguage } from "@contexts/LanguageContext";

const InfoPageOne = () => {
  const { lang } = useLanguage();

  return (
    <div className="example">
      <p className="example__header">{lang.info.header}</p>
      <p className="example__explain">{lang.info.title}</p>
      <p className="example__sub-header">{lang.info.sub_title1}</p>
      <div className="example__group">
        <div className="example__div">
          <div className="green btn--active">ㅎ</div>
          <div>ㅏ</div>
          <div>ㄴ</div>
          <div>ㅡ</div>
          <div>ㄹ</div>
        </div>
        <p className="example__text-explain">{lang.info.sub_desc1}</p>
        <div className="example__div">
          <div>ㄴ</div>
          <div className="yellow btn--active">ㅓ</div>
          <div>ㅇ</div>
          <div>ㅜ</div>
          <div>ㄹ</div>
        </div>
        <p className="example__text-explain">{lang.info.sub_desc2}</p>
        <div className="example__div">
          <div>ㅂ</div>
          <div>ㅏ</div>
          <div className="gray btn--active">ㄹ</div>
          <div>ㅣ</div>
          <div>ㅁ</div>
        </div>
        <p className="example__text-explain">{lang.info.sub_desc3}</p>
        <p className="example__sub-header">{lang.info.sub_title2}</p>
        <div className="example__div">
          <div className="letter-example">ㄱ</div>
          <div className="letter-example">ㄱ</div>
          <div>ㅗ</div>
          <div>ㅁ</div>
          <div>ㅏ</div>
        </div>
        <p className="example__text-explain">{lang.info.sub_desc4}</p>
        <div className="example__div">
          <div>ㄱ</div>
          <div className="letter-example">ㅗ</div>
          <div className="letter-example">ㅏ</div>
          <div>ㄱ</div>
          <div>ㅓ</div>
        </div>
        <p className="example__text-explain">{lang.info.sub_desc5}</p>
      </div>
    </div>
  );
};

export default InfoPageOne;
