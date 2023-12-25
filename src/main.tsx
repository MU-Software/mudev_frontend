import React from 'react';
import ReactDOM from 'react-dom/client';

import { Page } from '@local/page';
import './main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className='fullScreenAlert screenWidthTooNarrow'>
      화면이 너무 좁습니다.<br />화면을 넓혀주세요!
    </div>
    <Page className="mainPage" />
  </React.StrictMode>,
)

// PWA Support: Service Worker
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    console.log('ServiceWorker가 정상적으로 등록됐어요!:', registration.scope);
  }).catch((error) => {
    console.log('ServiceWorker 등록을 실패했어요...:', error);
  });
}
