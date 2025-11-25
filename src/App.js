import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "@pages/Home.js";
import WordleKor from "@pages/WordleKor.js";
import NotFound from "@pages/NotFound.js";
import "@styles/_reset.scss";
import "@styles/global.scss";

import hardMode from "@assets/hard-mode.json";
import imdtMode from "@assets/imdt-mode.json";
import easyMode from "@assets/easy-mode.json";

const modeMap = {
  easy: easyMode,
  imdt: imdtMode,
  hard: hardMode,
};

// Redirect component for /play/:mode to /play/:mode/:randomId
function RandomRedirect() {
  const { mode } = useParams();
  const wordList = modeMap[mode];
  
  if (!wordList) {
    return <Navigate to="/" replace />;
  }
  
  const randomId = Math.floor(Math.random() * wordList.length);
  return <Navigate to={`/play/${mode}/${randomId}`} replace />;
}

function App() {
  return (
    <Router basename={`${process.env.PUBLIC_URL}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:mode/:id" element={<WordleKor />} />
        <Route path="/play/:mode" element={<RandomRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
