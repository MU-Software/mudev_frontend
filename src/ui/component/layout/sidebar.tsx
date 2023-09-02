import Icon from '@mdi/react';
import React, { MouseEventHandler, useRef } from 'react';
import { Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import './sidebar.css';

class SidebarItemData {
  constructor(
    public readonly id: string,
    public readonly topBarTitleText: string,
    public readonly sideBarTooltipText: string,
    public readonly route: string,
    public readonly icon: string, // mdi icons are actually SVG string
    public readonly shouldBePositionedOnBottom: boolean = false,
  ) { }
}

const getSidebarItemUsingRoute = (sidebarItems: SidebarItemData[], inputRoute: string) => {
  for (const item of sidebarItems) {
    if (
      inputRoute !== '*' && (
        (inputRoute === '/' && item.route === '/')
        || (item.route !== '/' && inputRoute.startsWith(item.route))
      )
    )
      return item;
  }
  return new SidebarItemData('', '', '', '/unknown', '');
}

const SidebarItem: React.FC<{ data: SidebarItemData; }> = ({ data }) => {
  const navigate = useNavigate();
  return <OverlayTrigger
    placement='right'
    overlay={(titleProps) => <Tooltip {...titleProps}><div style={{ width: 'max-content' }}>{data.sideBarTooltipText}</div></Tooltip>} >
    <Nav.Item style={{flex: 'unset', marginTop: data.shouldBePositionedOnBottom ? 'auto' : undefined}}>
      <Nav.Link
        className='sidebarIconPills'
        eventKey={data.route}
        onClick={() => navigate(data.route)} >
        <Icon path={data.icon} size='16pt' />
      </Nav.Link>
    </Nav.Item>
  </OverlayTrigger>;
}

const SidebarContainerPuller: React.FC<{ sidebarContainer: React.RefObject<HTMLDivElement>; }> = ({ sidebarContainer }) => {
  const pullerIcon = useRef<HTMLDivElement>(null);

  window.addEventListener('resize', () => {
    sidebarContainer.current?.removeAttribute('style');
    pullerIcon.current?.removeAttribute('style');
  });

  const onSidebarPullerClick: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const isOpen = event.currentTarget.getAttribute('data-is-open') == 'true';
    event.currentTarget.setAttribute('data-is-open', (!isOpen).toString());
    if (sidebarContainer.current) sidebarContainer.current.style.left = isOpen ? '-4rem' : '0';
    if (pullerIcon.current) pullerIcon.current.style.transform = isOpen ? '' : 'rotate(180deg)';
  }

  return <div className='sidebarContainerPuller' onClick={onSidebarPullerClick}>
    <div id='sidebarContainerText' ref={pullerIcon}>▶</div>
  </div>;
};

const Sidebar: React.FC<{ sidebarItems: SidebarItemData[]; }> = ({ sidebarItems }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const item = getSidebarItemUsingRoute(sidebarItems, location.pathname);

  return <div className='sidebarContainer' id='sidebarContainer' ref={containerRef}>
    <SidebarContainerPuller sidebarContainer={containerRef} />
    <Nav fill variant='pills' activeKey={item.route} style={{ height: '100%', flexDirection: 'column', justifyContent: 'flex-start' }}>
      {sidebarItems.map((v) => <SidebarItem data={v} key={`sidebar-item-${v.id}`} />)}
    </Nav>
  </div>;
}

export { Sidebar, SidebarItemData };
