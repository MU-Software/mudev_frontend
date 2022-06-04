import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { Navbar, NavDropdown, Spinner, Form, FormCheck } from 'react-bootstrap';

import Icon from '@mdi/react';
import { mdiAccountCircle } from '@mdi/js';

import './topbar.css';
// import TopBarLogo from './logo_hanshin.svg';
import TopBarLogo from './mu_logo.png';
import { AccountInfo } from 'src/redux/modules/account/model';
import {
  refreshAccessTokenActionCreatorAsync,
  signOutActionCreatorAsync
} from 'src/redux/modules/account/action_creator';

export const TopBar: React.FC = (props: { disableBlur?: boolean; }) => {

  const navigate = useNavigate();
  const accountInfo: AccountInfo = useSelector(state => state.accountReducer);
  const dispatch = useDispatch();
  const [topBarState, setTopBarState] = useState({
    shouldDropdownShow: false,
    darkModeState: 'light',
    dummyVar: true,
  });

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const navBarContainerStyle = {
    ...(
      !props.disableBlur
        ? { backdropFilter: 'blur(12px)', } : {}),
  };

  const toggleDropdownShown = () => {
    setTopBarState(prevState => ({
      ...prevState,
      shouldDropdownShow: !(prevState.shouldDropdownShow),
    }));
  };

  // Dark mode settings
  const toggleDarkMode = (evt) => {
    evt.stopPropagation();
    const currentState = evt?.target?.checked ?? topBarState.darkModeState === 'dark';
    const darkModeValue = currentState ? 'dark' : 'light';
    localStorage.setItem('color-theme', darkModeValue);
    document.documentElement.setAttribute('color-theme', darkModeValue);
    setTopBarState(prevState => ({ ...prevState, darkModeState: darkModeValue, }));
  };

  useEffect(() => {
    dispatch(refreshAccessTokenActionCreatorAsync());

    const isUserColorTheme = localStorage.getItem('color-theme');
    const isOsColorTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const detectDarkMode = isUserColorTheme ? isUserColorTheme : isOsColorTheme;
    localStorage.setItem('color-theme', detectDarkMode);
    document.documentElement.setAttribute('color-theme', detectDarkMode);
    setTopBarState(prevState => ({ ...prevState, darkModeState: detectDarkMode, }));
  }, []);

  const goToSignIn = () => navigate('/account/signin');
  const goToSignOut = () => {
    dispatch(signOutActionCreatorAsync());
    navigate('/');
  };


  return <div className='muNavBarContainer' style={navBarContainerStyle}>
    <Navbar className='muNavBar'>
      <Navbar.Brand href='/' className='muNavBarLogoContainer'>
        <img src={TopBarLogo} />
      </Navbar.Brand>

      <NavDropdown
        align='end'
        show={topBarState.shouldDropdownShow}
        onClick={toggleDropdownShown}
        title={<Icon path={mdiAccountCircle} />}
        className='muNavBarDropdown' >
        <NavDropdown.Header className='muNavBarDropdownItem'>{
          accountInfo.isFetching
            ? <div className='muNavBarDropdownAccountInfoLoadingContainer'>
              <Spinner animation='border' role='status' size='sm'>
                <span className='visually-hidden'>Loading...</span>
              </Spinner>
              <div className='muNavBarDropdownAccountInfoLoadingText'>
                계정 정보 불러오는 중...
              </div>
            </div>
            : accountInfo.isSignedIn ? `안녕하세요, ${accountInfo.nick}님!` : '로그인을 해 주세요!'
        }</NavDropdown.Header>
        {
          accountInfo.isSignedIn && <>
            <NavDropdown.Divider className='muNavBarDropdownItem' />
            <NavDropdown.Item
              className='muNavBarDropdownItem'
              href='#'
              onClick={() => navigate('/account/setting')}>
              계정 설정
            </NavDropdown.Item>
          </>
        }
        <NavDropdown.Divider className='muNavBarDropdownItem' />
        <NavDropdown.Item
          className='muNavBarDropdownItem'
          href='#'
          onClick={accountInfo.isSignedIn ? goToSignOut : goToSignIn}>
          {accountInfo.isSignedIn ? '로그아웃' : '로그인'}
        </NavDropdown.Item>

        <NavDropdown.Divider className='muNavBarDropdownItem' />
        <NavDropdown.Item as='div' className='muNavBarDropdownItem' onClick={toggleDarkMode}>
          <FormCheck
            type='switch'
            // className="muNavBarDarkmodeSwitch"
            id='muNavBarDarkModeSwitchID'
            label="다크모드 설정"
            onChange={toggleDarkMode}
            value={topBarState.darkModeState === 'dark'}
            checked={topBarState.darkModeState === 'dark'}
          />
        </NavDropdown.Item>
      </NavDropdown>

    </Navbar>
  </div>;
}
