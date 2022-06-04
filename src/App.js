// Project GLOW(w. DUSK theme) / PLAYCO (mudev.cc & PlayCo Service frontend)
// (c) MUsoftware, 2022, MIT
'use strict';

import React, { useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

import { Sidebar } from './ui/util/sidebar';
import { TopBar } from './ui/util/topbar';
import { DummySidebar } from './ui/util/dummySidebar';

import { GlowHome } from './ui/page/home/home';
import { NotFound } from './ui/page/common/notfound';
import { BCaMain } from './ui/page/bca/main';
import { BlogRoot } from './ui/page/blog/blogRoot';

import { ToolMain } from './ui/page/tool/main';
import { QRDecoderMain } from './ui/page/tool/subpage/qrDecode';
import { ProtocolParserMain } from './ui/page/tool/subpage/protocolParser';

import { AccountSignUp } from './ui/page/account/signup';
import { AccountSignIn } from './ui/page/account/signin';
import { AccountPasswordChange } from './ui/page/account/changePassword';
import { AccountPasswordReset } from './ui/page/account/resetPassword';
import { AccountDeactivate } from './ui/page/account/deactivate';
import { WelcomeToMuDev } from './ui/page/account/welcomeToMuDev';
import { MailSentWelcomeToMuDev } from './ui/page/account/mailSentWelcomeToMuDev';
import { AccountConfig } from './ui/page/account/accountConfig';

import { PlaycoMain } from './ui/page/playco/main';
import { PlayCoPlaylistDetail } from './ui/page/playco/playlistDetailPage';

const App = () => {
  const [appProps, setAppProps] = useState({
    topBarProps: {
      disableBlur: false,
    },
    mainContentProps: {
      style: {},
    },
  });

  return <div className='App'>
    <BrowserRouter>
      <TopBar {...appProps.topBarProps} />
      <Sidebar />
      <div className='mainContent' {...appProps.mainContentProps}>
        <Routes>
          <Route exact path='/' className='nav-link' element={<GlowHome />} />
          <Route exact path='/account/signup' className='nav-link' element={<AccountSignUp />} />
          <Route exact path='/account/signin' className='nav-link' element={<AccountSignIn />} />
          <Route exact path='/account/setting' className='nav-link' element={<AccountConfig />} />
          <Route exact path='/account/change-password' className='nav-link' element={<AccountPasswordChange />} />
          <Route exact path='/account/reset-password' className='nav-link' element={<AccountPasswordReset />} />
          <Route exact path='/account/deactivate' className='nav-link' element={<AccountDeactivate />} />
          <Route exact path='/account/welcome-to-mudev' className='nav-link' element={<WelcomeToMuDev />} />
          <Route exact path='/account/welcome-to-mudev-mail' className='nav-link' element={<MailSentWelcomeToMuDev />} />
          <Route exact path='/bca' className='nav-link' element={<BCaMain />} />
          <Route exact path='/playco' className='nav-link' element={<PlaycoMain />} />
          <Route exact path='/playco/:playlistId' className='nav-link' element={<PlayCoPlaylistDetail />} />
          <Route exact path='/tool' className='nav-link' element={<ToolMain />} />
          <Route exact path='/tool/qrdecode' className='nav-link' element={<QRDecoderMain parentPropsStateFunc={setAppProps} />} />
          <Route exact path='/tool/network-protocol-parser' className='nav-link' element={<ProtocolParserMain parentPropsStateFunc={setAppProps} />} />
          <Route exact path='/blog' className='nav-link' element={<BlogRoot />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </div>
      <DummySidebar />
    </BrowserRouter>
  </div>
}

export default App;
