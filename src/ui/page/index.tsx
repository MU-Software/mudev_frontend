import { mdiAccountCircle, mdiAccountPlusOutline, mdiCloudDownloadOutline, mdiHome } from '@mdi/js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { DummySidebar, Sidebar } from '@local/ui/component/bar/sidebar'
import { Topbar } from '@local/ui/component/bar/topbar'
import { RouteDefinition, RouteDefinitionList } from '@local/ui/util/route_manager'

// import { BlogMain } from '@local/page/blog'
import { HomeMain } from '@local/page/home'
// import { PlayCoMain } from '@local/page/playco'
import { SignInHistoryPage } from '@local/page/account/signInHistory'
import { SignInPage } from '@local/page/account/signin'
import { SignOutPage } from '@local/page/account/signout'
import { SignUpPage } from '@local/page/account/signup'
import { NotFoundMain } from '@local/page/internal/notfound'
import { SSCoListPage } from '@local/page/ssco'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 3, refetchOnMount: 'always', gcTime: 1, staleTime: 10000 } },
})

const ReactQueryDevtools = React.lazy(() =>
  !import.meta.env.PROD
    ? import('@tanstack/react-query-devtools').then((module) => ({ default: module.ReactQueryDevtools }))
    : Promise.resolve({ default: () => null })
)

const ROUTE_DEFINITIONS: RouteDefinitionList = new RouteDefinitionList([
  new RouteDefinition('home', 'MUsoftware', '홈', '/', <HomeMain />, mdiHome),
  // new RouteDefinition('playco', 'PlayCo', 'PlayCo', '/playco', <PlayCoMain />, mdiPlayCircleOutline),
  new RouteDefinition('ssco', 'SSCo', 'SSCo', '/ssco', <SSCoListPage />, mdiCloudDownloadOutline, false),
  // new RouteDefinition('blog', '블로그', '블로그', '/blog', <BlogMain />, mdiPost, true, false),
  new RouteDefinition('not_found', '', '', '*', <NotFoundMain />, '', false),
  new RouteDefinition(
    '/account/signin',
    '로그인',
    '로그인',
    '/account/signin',
    <SignInPage />,
    mdiAccountCircle,
    false
  ),
  new RouteDefinition(
    '/account/signup',
    '회원가입',
    '회원가입',
    '/account/signup',
    <SignUpPage />,
    mdiAccountPlusOutline,
    false
  ),
  new RouteDefinition(
    '/account/signout',
    '로그아웃',
    '로그아웃',
    '/account/signout',
    <SignOutPage />,
    mdiAccountCircle,
    false
  ),
  new RouteDefinition(
    '/account/history',
    '로그인 된 기기 목록',
    '로그인 된 기기 목록',
    '/account/device',
    <SignInHistoryPage />,
    mdiAccountCircle,
    false
  ),
])

export const Page: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <QueryClientProvider client={queryClient}>
      {<ReactQueryDevtools initialIsOpen={false} />}
      <BrowserRouter>
        <Topbar routeData={ROUTE_DEFINITIONS.topbarRoutes} />
        <Sidebar sidebarItems={ROUTE_DEFINITIONS.sidebarItems} />
        <DummySidebar />
        {ROUTE_DEFINITIONS.routes}
      </BrowserRouter>
    </QueryClientProvider>
  </div>
)
