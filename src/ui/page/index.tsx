import { mdiHome, mdiPlayCircleOutline, mdiPost } from '@mdi/js';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { Sidebar } from '@ui/component/layout/sidebar';
import { Topbar } from '@ui/component/layout/topbar';
import { RouteDefinition, RouteDefinitionList } from '@ui/util/route_manager';

import { BlogMain } from '@page/blog';
import { HomeMain } from '@page/home';
import { PlayCoMain } from '@page/playco';
import { NotFoundMain } from './internal/notfound';

const ROUTE_DEFINITIONS: RouteDefinitionList = new RouteDefinitionList([
  new RouteDefinition('home', 'MUsoftware', '홈', '/', <HomeMain />, mdiHome),
  new RouteDefinition('playco', 'PlayCo', 'PlayCo', '/playco', <PlayCoMain />, mdiPlayCircleOutline),
  new RouteDefinition('blog', '블로그', '블로그', '/blog', <BlogMain />, mdiPost, true, true),
  new RouteDefinition('not_found', '', '', '*', <NotFoundMain />, '', false),
]);

export const Page: React.FC<{ className?: string; }> = ({ className }) => <div className={className}>
  <BrowserRouter>
    <Topbar routeData={ROUTE_DEFINITIONS.topbarRoutes} />
    <Sidebar sidebarItems={ROUTE_DEFINITIONS.sidebarItems} />
    {ROUTE_DEFINITIONS.routes}
  </BrowserRouter>
</div>;
