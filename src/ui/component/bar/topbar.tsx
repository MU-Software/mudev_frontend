import './topbar.css'

import { mdiAccountCircle } from '@mdi/js'
import Icon from '@mdi/react'
import { wrap } from '@suspensive/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Form, NavDropdown, Navbar } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'

// TODO: FIXME: Use SVG instead of PNG
import TopBarLogo from '@local/asset/image/logo/mu_logo.png'
import { useIsSignedIn } from '@local/network/client'
import { fetchMyInfo } from '@local/network/route/user'
import {
  darkThemeTypeCollection,
  getCurrentTheme,
  isDeepDarkEnabled,
  toggleDeepDark,
  toggleTheme,
} from '@local/ui/util/dark_mode'
import { PHLoading } from '../element/phLoading'

class TopbarRouteData {
  constructor(
    public readonly title: string,
    public readonly route: string
  ) {}
}

const AccountInfoFallback: React.FC = () => {
  const navigate = useNavigate()
  return (
    <>
      <NavDropdown.Item className="navBarDropdownItem" href="#" onClick={() => navigate('/account/signin')}>
        로그인
      </NavDropdown.Item>
      <NavDropdown.Item className="navBarDropdownItem" href="#" onClick={() => navigate('/account/signup')}>
        회원가입
      </NavDropdown.Item>
    </>
  )
}

const AccountInfoLoading: React.FC = () => (
  <NavDropdown.Item className="navBarDropdownItem">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PHLoading primaryColor="#000000" />
    </div>
  </NavDropdown.Item>
)

const AccountInfoSignedIn: React.FC = wrap.Suspense({ fallback: <AccountInfoLoading /> }).on(() => {
  const navigate = useNavigate()
  const query = useSuspenseQuery({ queryKey: ['user', 'info'], queryFn: fetchMyInfo, retry: 1 })

  return (
    <>
      <NavDropdown.ItemText className="navBarDropdownItem">{query.data.nickname}</NavDropdown.ItemText>
      <NavDropdown.Divider className="navBarDropdownItem" />
      <NavDropdown.Item className="navBarDropdownItem" onClick={() => navigate('/account/info/me')}>
        계정 설정
      </NavDropdown.Item>
      <NavDropdown.Item className="navBarDropdownItem" onClick={() => navigate('/account/signout')}>
        로그아웃
      </NavDropdown.Item>
    </>
  )
})

const AccountInfo: React.FC = wrap
  .ErrorBoundaryGroup({ blockOutside: true })
  .ErrorBoundary({ fallback: AccountInfoFallback })
  .Suspense({ fallback: <AccountInfoLoading /> })
  .on(() => {
    return useIsSignedIn().data ? <AccountInfoSignedIn /> : <AccountInfoFallback />
  })

const NavBarDropdown: React.FC = () => {
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

  return (
    <NavDropdown
      align="end"
      show={topBarState.shouldDropdownShow}
      onClick={toggleDropdownShown}
      title={<Icon path={mdiAccountCircle} size="24pt" />}
      className="navBarDropdown"
    >
      <AccountInfo />
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
