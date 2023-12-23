import { mdiHome, mdiPlayCircleOutline, mdiPost } from '@mdi/js';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter } from 'react-router-dom';

import { DummySidebar, Sidebar } from '@ui/component/bar/sidebar';
import { Topbar } from '@ui/component/bar/topbar';
import { RouteDefinition, RouteDefinitionList } from '@ui/util/route_manager';

import { BlogMain } from '@page/blog';
import { HomeMain } from '@page/home';
import { PlayCoMain } from '@page/playco';
import { NotFoundMain } from './internal/notfound';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 3, suspense: true } } })

const ROUTE_DEFINITIONS: RouteDefinitionList = new RouteDefinitionList([
  new RouteDefinition('home', 'MUsoftware', '홈', '/', <HomeMain />, mdiHome),
  new RouteDefinition('playco', 'PlayCo', 'PlayCo', '/playco', <PlayCoMain />, mdiPlayCircleOutline),
  new RouteDefinition('blog', '블로그', '블로그', '/blog', <BlogMain />, mdiPost, true, true),
  new RouteDefinition('not_found', '', '', '*', <NotFoundMain />, '', false),
]);

export const Page: React.FC<{ className?: string; }> = ({ className }) => <div className={className}>
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />
  <BrowserRouter>
    <Topbar routeData={ROUTE_DEFINITIONS.topbarRoutes} />
    <Sidebar sidebarItems={ROUTE_DEFINITIONS.sidebarItems} />
    <DummySidebar />
    {ROUTE_DEFINITIONS.routes}
  </BrowserRouter>
  </QueryClientProvider>
</div>;
