import { css } from '@emotion/css';
import Icon from '@mdi/react';
import React from 'react';
import { Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import { SIDEBAR_HIDE_MEDIA_QUERY } from '@const/ui';

const baseSidebarStyle = css({
  position: "fixed",
  top: "var(--topbar-height)",

  height: "var(--sidebar-height)",
  width: "var(--sidebar-width)",

  borderRadius: "0 .25rem .25rem 0 !important",
  transition: "0.1s !important",
});

const sidebarStyle = css(baseSidebarStyle, {
  left: 0,
  zIndex: "var(--sidebar-z-index) !important",
  [SIDEBAR_HIDE_MEDIA_QUERY]: {
    left: "calc(var(--sidebar-width) * -1)",
    borderRight: "2px var(--color-50) dashed",
    backgroundColor: "var(--color-25)",
  }
});

const dummySidebarStyle = css(baseSidebarStyle, {
  float: "right",
  right: 0,
  zIndex: "var(--dummy-sidebar-z-index) !important",
  [SIDEBAR_HIDE_MEDIA_QUERY]: { display: "none" }
});

const sidebarContainerPullerStyle = css({
  position: "absolute",
  width: "var(--sidebar-puller-width)",
  height: "var(--sidebar-puller-height)",
  padding: "0.1rem",

  right: "calc(var(--sidebar-puller-width) * -1)",
  top: "calc((100% - var(--sidebar-puller-height)) / 2)",

  fontSize: "0.75em",

  backgroundColor: "var(--color-50)",
  borderTop: "1px solid var(--color-25)",
  borderBottom: "1px solid var(--color-25)",
  borderRight: "1px solid var(--color-25)",
  borderRadius: "0 .25rem .25rem 0 !important",
  display: "none",
  justifyContent: "center",
  alignItems: "center",

  zIndex: "var(--sidebar-z-index) !important",
  [SIDEBAR_HIDE_MEDIA_QUERY]: { display: "flex" }
});

const sidebarIconPillsStyle = css({
  // I hate those !important things
  display: "flex !important",
  justifyContent: "center !important",
  alignItems: "center !important",

  width: "var(--sidebar-width) !important",
  height: "var(--sidebar-pill-height) !important",
  paddingTop: "0.5rem !important",
  paddingBottom: "0.5rem !important",
  borderRadius: "0 0.25rem 0.25rem 0 !important",

  color: "var(--color-50) !important",
  transition: "var(--transition-duration) !important",
  '&:hover:not(.active)': {backgroundColor: "var(--sidebar-background-hovered) !important" },
  '&:active': {
    backgroundColor: "var(--sidebar-background-selected) !important",
    color: "var(--color) !important",
    transform: "scale(1.1) !important",
  }
});

const navItemStyle = css({
  ".active": {
    backgroundColor: "var(--sidebar-background-selected) !important",
    color: "var(--color) !important",
    'svg': { color: 'var(--color) !important' },
  },
});

const DummySidebar: React.FC = () => <div className={dummySidebarStyle} />;

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
    <Nav.Item className={navItemStyle} style={{ flex: 'unset', marginTop: data.shouldBePositionedOnBottom ? 'auto' : undefined }}>
      <Nav.Link
        className={sidebarIconPillsStyle}
        eventKey={data.route}
        onClick={() => navigate(data.route)} >
        <Icon path={data.icon} size='16pt' />
      </Nav.Link>
    </Nav.Item>
  </OverlayTrigger>;
}

const SidebarContainerPuller: React.FC<{ sidebarContainer: React.RefObject<HTMLDivElement>; }> = ({ sidebarContainer }) => {
  const pullerIcon = React.useRef<HTMLDivElement>(null);

  window.addEventListener('resize', () => {
    sidebarContainer.current?.removeAttribute('style');
    pullerIcon.current?.removeAttribute('style');
  });

  const onSidebarPullerClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const isOpen = event.currentTarget.getAttribute('data-is-open') == 'true';
    event.currentTarget.setAttribute('data-is-open', (!isOpen).toString());
    if (sidebarContainer.current) sidebarContainer.current.style.left = isOpen ? '-4rem' : '0';
    if (pullerIcon.current) pullerIcon.current.style.transform = isOpen ? '' : 'rotate(180deg)';
  }

  return <div className={sidebarContainerPullerStyle} onClick={onSidebarPullerClick}>
    <div id='sidebarContainerText' ref={pullerIcon}>▶</div>
  </div>;
};

const Sidebar: React.FC<{ sidebarItems: SidebarItemData[]; }> = ({ sidebarItems }) => {
  const location = useLocation();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const item = getSidebarItemUsingRoute(sidebarItems, location.pathname);

  return <div className={sidebarStyle} ref={containerRef}>
    <SidebarContainerPuller sidebarContainer={containerRef} />
    <Nav fill variant='pills' activeKey={item.route} style={{ height: '100%', flexDirection: 'column', justifyContent: 'flex-start' }}>
      {sidebarItems.map((v) => <SidebarItem data={v} key={`sidebar-item-${v.id}`} />)}
    </Nav>
  </div>;
}

export { DummySidebar, Sidebar, SidebarItemData };
