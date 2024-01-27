import './topbar.css'

import { mdiAccountCircle } from '@mdi/js'
import Icon from '@mdi/react'
import React, { useState } from 'react'
import { Form, NavDropdown, Navbar } from 'react-bootstrap'
import { ErrorBoundary } from 'react-error-boundary'
import { useLocation, useNavigate } from 'react-router-dom'

// TODO: FIXME: Use SVG instead of PNG
import TopBarLogo from '@local/asset/image/logo/mu_logo.png'
import { fetchMyInfo } from '@local/network/route/user'
import {
  darkThemeTypeCollection,
  getCurrentTheme,
  isDeepDarkEnabled,
  toggleDeepDark,
  toggleTheme,
} from '@local/ui/util/dark_mode'
import { useSuspenseQuery } from '@tanstack/react-query'
import { PHLoading } from '../element/phLoading'

class TopbarRouteData {
  constructor(
    public readonly title: string,
    public readonly route: string
  ) {}
}

const AccountInfo: () => React.ReactNode = () => {
  const navigate = useNavigate()
  const goToSignOut = () => navigate('/account/signout')
  const goToSetting = () => navigate('/account/info/me')
  const query = useSuspenseQuery({ queryKey: ['topbar', 'account', 'info'], queryFn: fetchMyInfo, retry: false })

  return (
    <>
      <NavDropdown.ItemText className="navBarDropdownItem">{query.data.nickname}</NavDropdown.ItemText>
      <NavDropdown.Divider className="navBarDropdownItem" />
      <NavDropdown.Item className="navBarDropdownItem" onClick={goToSetting}>
        계정 설정
      </NavDropdown.Item>
      <NavDropdown.Item className="navBarDropdownItem" onClick={goToSignOut}>
        로그아웃
      </NavDropdown.Item>
    </>
  )
}

const NavBarDropdown: () => React.ReactNode = () => {
  const navigate = useNavigate()
  const goToSignIn = () => navigate('/account/signin')
  const goToSignUp = () => navigate('/account/signup')

  const [topBarState, setTopBarState] = useState({
    shouldDropdownShow: false,
    theme: getCurrentTheme(),
    isDeepDarkEnabled: isDeepDarkEnabled(),
  })

  const toggleDropdownShown = () =>
    setTopBarState({ ...topBarState, shouldDropdownShow: !topBarState.shouldDropdownShow })
  const toggleDarkMode = () => setTopBarState({ ...topBarState, theme: toggleTheme() })
  const toggleDeepDarkMode = () => {
    const isDeepDarkEnabled = toggleDeepDark()
    setTopBarState({
      ...topBarState,
      isDeepDarkEnabled: isDeepDarkEnabled,
      theme: getCurrentTheme(),
    })
    return true
  }
  const isThemeDark: boolean = darkThemeTypeCollection.includes(topBarState.theme)

  const loadingElement = (
    <NavDropdown.Item className="navBarDropdownItem">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PHLoading primaryColor="#000000" />
      </div>
    </NavDropdown.Item>
  )

  return (
    <NavDropdown
      align="end"
      show={topBarState.shouldDropdownShow}
      onClick={toggleDropdownShown}
      title={<Icon path={mdiAccountCircle} size="24pt" />}
      className="navBarDropdown"
    >
      <ErrorBoundary
        fallback={
          <>
            <NavDropdown.Item className="navBarDropdownItem" href="#" onClick={goToSignIn}>
              로그인
            </NavDropdown.Item>
            <NavDropdown.Item className="navBarDropdownItem" href="#" onClick={goToSignUp}>
              회원가입
            </NavDropdown.Item>
          </>
        }
      >
        <React.Suspense fallback={loadingElement}>
          <AccountInfo />
        </React.Suspense>
      </ErrorBoundary>
      <NavDropdown.Divider className="navBarDropdownItem" />
      <NavDropdown.ItemText as="div" className="navBarDropdownItem">
        <Form.Switch label="다크모드" checked={isThemeDark} onChange={toggleDarkMode} />
        {isThemeDark && (
          <Form.Switch label="더 어둡게!" checked={topBarState.isDeepDarkEnabled} onChange={toggleDeepDarkMode} />
        )}
      </NavDropdown.ItemText>
    </NavDropdown>
  )
}

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
      inputRoute !== '*' &&
      ((inputRoute === '/' && item.route === '/') || (item.route !== '/' && inputRoute?.startsWith(item.route)))
    )
      return item.title
  }
  return ''
}

const Topbar: React.FC<{ routeData: TopbarRouteData[] }> = ({ routeData }) => {
  const location = useLocation()
  const title = getTopbarTitleUsingRoute(routeData, location.pathname)

  return (
    <Navbar className="navBar">
      <Navbar.Brand href="/" className="navBarLogoContainer">
        <img src={TopBarLogo} />
      </Navbar.Brand>
      |<Navbar.Text className="navBarTitle">{title}</Navbar.Text>
      <NavBarDropdown />
    </Navbar>
  )
}

export { Topbar, TopbarRouteData }
