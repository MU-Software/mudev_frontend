import './topbar.css';

import { mdiAccountCircle } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useState } from 'react';
import { Form, NavDropdown, Navbar } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

import TopBarLogo from '@local/asset/image/logo/mu_logo.png'; // TODO: FIXME: Use SVG instead of PNG
import { darkThemeTypeCollection, getCurrentTheme, isDeepDarkEnabled, toggleDeepDark, toggleTheme } from '@local/ui/util/dark_mode';

class TopbarRouteData {
  constructor(
    public readonly title: string,
    public readonly route: string
  ) { }
}

const AccountInfo: () => React.ReactNode = () => {
  return <>{
    // accountInfo.isFetching
    //   ? <div className='navBarDropdownAccountInfoLoadingContainer'>
    //     <Spinner animation='border' role='status' size='sm'>
    //       <span className='visually-hidden'>Loading...</span>
    //     </Spinner>
    //     <div className='navBarDropdownAccountInfoLoadingText'>
    //       계정 정보 불러오는 중...
    //     </div>
    //   </div>
    //   : accountInfo.isSignedIn ? `안녕하세요, ${accountInfo.nick}님!` : '로그인을 해 주세요!'
  }</>;
};

const AccountSettingButton: () => React.ReactNode = () => {
  // const navigate = useNavigate();

  // return (accountInfo.isFetching || !accountInfo.isSignedIn) ? <></> : <>
  //   <NavDropdown.Divider className='navBarDropdownItem' />
  //   <NavDropdown.Item
  //     className='navBarDropdownItem'
  //     href='#'
  //     onClick={() => navigate('/account/setting')}>
  //     계정 설정
  //   </NavDropdown.Item>
  // </>;
  return <></>;
};

const AccountSignInOutButton: () => React.ReactNode = () => {
  // const navigate = useNavigate();
  // const goToSignIn = () => navigate('/account/signin');
  // const goToSignOut = () => navigate('/account/signout');

  // return <NavDropdown.Item
  //   className='navBarDropdownItem'
  //   href='#'
  //   onClick={accountInfo.isSignedIn ? goToSignOut : goToSignIn}
  // >{accountInfo.isSignedIn ? '로그아웃' : '로그인'}</NavDropdown.Item>
  return <></>;
};

const NavBarDropdown: () => React.ReactNode = () => {
  const [topBarState, setTopBarState] = useState({
    shouldDropdownShow: false,
    theme: getCurrentTheme(),
    isDeepDarkEnabled: isDeepDarkEnabled(),
  });

  const toggleDropdownShown = () => setTopBarState({ ...topBarState, shouldDropdownShow: !topBarState.shouldDropdownShow });
  const toggleDarkMode = () => {setTopBarState({ ...topBarState, theme: toggleTheme() }); return true;};
  const toggleDeepDarkMode = () => {
    const isDeepDarkEnabled = toggleDeepDark();
    setTopBarState({
      ...topBarState,
      isDeepDarkEnabled: isDeepDarkEnabled,
      theme: getCurrentTheme(),
    });
    return true;
  };

  const isThemeDark: boolean = darkThemeTypeCollection.includes(topBarState.theme);

  return <NavDropdown
    align='end'
    show={topBarState.shouldDropdownShow}
    onClick={toggleDropdownShown}
    title={<Icon path={mdiAccountCircle} size='24pt' />}
    className='navBarDropdown'
  >
    <NavDropdown.Header className='navBarDropdownItem'><AccountInfo /></NavDropdown.Header>
    <AccountSettingButton />
    <AccountSignInOutButton />

    <NavDropdown.Divider className='navBarDropdownItem' />
    <NavDropdown.Item as='div' className='navBarDropdownItem'>
      <Form.Switch label='다크모드 설정' checked={isThemeDark} onChange={toggleDarkMode} />
      {isThemeDark && <Form.Switch label='더 어둡게!' checked={topBarState.isDeepDarkEnabled} onChange={toggleDeepDarkMode} />}
    </NavDropdown.Item>
  </NavDropdown>
};

const getTopbarTitleUsingRoute = (routeData: TopbarRouteData[], inputRoute?: string) => {
  // TODO: FIXME: This and the sidebar can return the wrong result if .route is a substring of another .route.
  // For example, if the routeData is:
  // [
  //   { route: '/', title: '홈' },
  //   { route: '/account', title: '계정A' },
  //   { route: '/account/additional', title: '계정B' },
  // ]
  // and the inputRoute is '/account/additional', then this function will return '계약A' instead of '계정B'.
  for (const item of routeData) {
    if (
      inputRoute !== '*' && (
        (inputRoute === '/' && item.route === '/')
        || (item.route !== '/' && inputRoute?.startsWith(item.route))
      )
    )
      return item.title;
  }
  return '';
};

const Topbar: React.FC<{routeData: TopbarRouteData[];}> = ({ routeData }) => {
  const location = useLocation();
  const title = getTopbarTitleUsingRoute(routeData, location.pathname);

  return <Navbar className='navBar'>
    <Navbar.Brand href='/' className='navBarLogoContainer'>
      <img src={TopBarLogo} />
    </Navbar.Brand>
    |<Navbar.Text className='navBarTitle'>{title}</Navbar.Text>

    <NavBarDropdown />
  </Navbar>;
};

export { Topbar, TopbarRouteData };
