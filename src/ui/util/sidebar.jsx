import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiHome, mdiTools, mdiPlaylistMusic, mdiCardAccountDetails } from '@mdi/js';

import './sidebar.css';

class SidebarItemData {
  // targetId: string;
  // title: string;
  // route: string;
  // icon: string; // mdi icons are actually SVG string.
  constructor(targetId, title, route, icon) {
    this.targetId = targetId;
    this.title = title;
    this.route = route;
    this.icon = icon;
  }
}

const SIDEBAR_ITEMS = {
  HOME: new SidebarItemData('sidebarHomeBtn', '홈', '/', mdiHome),
  // PROJECT: new SidebarItemData('sidebarBCaBtn', 'B.Ca', '/bca', mdiCardAccountDetails),
  CONTAINER: new SidebarItemData('sidebarPlayCoBtn', 'PlayCO', '/playco', mdiPlaylistMusic),
  TOOL: new SidebarItemData('sidebarToolBtn', 'Tools', '/tool', mdiTools),
};

const getSidebarItemUsingRoute: React.FC = (route: string) => {
  for (const [k, v] of Object.entries(SIDEBAR_ITEMS)) {
    if (v.route === '/') { if (v.route === route) return [k, v]; }
    else { if (route.startsWith(v.route)) return [k, v]; }
  }
  return [null, { route: '/unknown' }];
}

interface SidebarItemPropTypes {
  data: SidebarItemData;
}

const SidebarItem: React.FC = ({ data }: SidebarItemPropTypes) => {
  const navigate = useNavigate();

  return <OverlayTrigger
    placement='right'
    overlay={(titleProps) => <Tooltip {...titleProps}>{data.title}</Tooltip>} >
    <Nav.Item>
      <Nav.Link
        className='sidebarIconPills'
        eventKey={data.route}
        onClick={() => navigate(data.route)} >
        <Icon path={data.icon} size='16pt' />
      </Nav.Link>
    </Nav.Item>
  </OverlayTrigger>;
}

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarItem = getSidebarItemUsingRoute(location.pathname);
  const onAfterSidebarPullerClick = (event) => {
    event.stopPropagation();
    event.preventDefault();

    event.target.onclick = onSidebarPullerClick;
    document.getElementById('sidebarContainer').style.left = '-4rem';
    document.getElementById('sidebarContainerText').style.transform = '';
  };
  const onSidebarPullerClick = (event) => {
    event.stopPropagation();
    event.preventDefault();

    event.target.onclick = onAfterSidebarPullerClick;
    document.getElementById('sidebarContainer').style.left = '0';
    document.getElementById('sidebarContainerText').style.transform = 'rotate(180deg)';
  };

  window.addEventListener('resize', () => {
    document.getElementById('sidebarContainer').removeAttribute('style');
    document.getElementById('sidebarContainerText').removeAttribute('style');
  });

  return <div className='sidebarContainer' id='sidebarContainer'>
    <div className='sidebarContainerPuller' onClick={onSidebarPullerClick}>
      <div id='sidebarContainerText'>▶</div>
    </div>
    <Nav fill variant='pills' activeKey={sidebarItem[1].route}>
      {Object.entries(SIDEBAR_ITEMS).map(([k, v]) => <SidebarItem data={v} key={v.targetId} />)}
    </Nav>
  </div>
}
