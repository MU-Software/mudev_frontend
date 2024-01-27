import { css } from '@emotion/css'
import React from 'react'

import { DUMMY_SIDEBAR_HIDE_MEDIA_QUERY, SIDEBAR_HIDE_MEDIA_QUERY } from '@local/const/ui'

const phPageContainerStyle = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
})

const phPageStyle = css({
  minHeight: 'calc(100% - var(--topbar-height))',
  height: 'calc(100% - var(--topbar-height))',
  maxHeight: 'calc(100% - var(--topbar-height))',
  minWidth: 'calc(100% - (var(--sidebar-width) * 2))',
  width: 'calc(100% - (var(--sidebar-width) * 2))',
  maxWidth: 'calc(100% - (var(--sidebar-width) * 2))',

  transition: [
    'min-width var(--transition-duration)',
    'width var(--transition-duration)',
    'max-width var(--transition-duration)',
    'left var(--transition-duration)',
  ],
  marginLeft: 'var(--sidebar-width)',
  marginTop: 'var(--topbar-height)',
  [DUMMY_SIDEBAR_HIDE_MEDIA_QUERY]: {
    minWidth: 'calc(100% - var(--sidebar-width))',
    width: 'calc(100% - var(--sidebar-width))',
    maxWidth: 'calc(100% - var(--sidebar-width))',
  },
  [SIDEBAR_HIDE_MEDIA_QUERY]: {
    minWidth: '100%',
    width: '100%',
    maxWidth: '100%',
    marginLeft: 0,
  },
})

type PHPageProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const PHPage: React.FC<PHPageProps> = (props) => (
  <div className={phPageContainerStyle}>
    <div className={phPageStyle}>{props.children}</div>
  </div>
)
