import React from "react";
import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@contexts/LanguageContext";
import App from "./App";

// 动态注入 Umami Analytics 脚本
// 优先使用运行时配置（Docker），其次使用构建时环境变量（本地开发）
const runtimeConfig = window.__RUNTIME_CONFIG__ || {};
const umamiWebsiteId = runtimeConfig.UMAMI_WEBSITE_ID || process.env.REACT_APP_UMAMI_WEBSITE_ID;
const umamiSrc = runtimeConfig.UMAMI_SRC || process.env.REACT_APP_UMAMI_SRC || 'https://cloud.umami.is/script.js';

if (umamiWebsiteId) {
  const script = document.createElement('script');
  script.defer = true;
  script.src = umamiSrc;
  script.setAttribute('data-website-id', umamiWebsiteId);
  document.head.appendChild(script);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <HelmetProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </HelmetProvider>
    </RecoilRoot>
  </React.StrictMode>
);
