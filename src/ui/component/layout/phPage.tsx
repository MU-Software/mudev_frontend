import { css } from '@emotion/css'
import React from 'react'

import { DUMMY_SIDEBAR_HIDE_MEDIA_QUERY, SIDEBAR_HIDE_MEDIA_QUERY } from '@local/const/ui'

const phPageStyle = css({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  flexDirection: 'column',

  minHeight: '100%',
  height: '100%',
  minWidth: '100%',
  width: '100%',

  transition: [
    'min-width var(--transition-duration)',
    'width var(--transition-duration)',
    'max-width var(--transition-duration)',
    'left var(--transition-duration)',
  ],

  paddingTop: 'var(--topbar-height)',
  paddingRight: 'var(--sidebar-width)',
  paddingLeft: 'var(--sidebar-width)',
  [DUMMY_SIDEBAR_HIDE_MEDIA_QUERY]: { paddingRight: '0' },
  [SIDEBAR_HIDE_MEDIA_QUERY]: { paddingLeft: '0' },
})

export const PHPage: React.FC<React.PropsWithChildren> = (props) => (
  <div className={phPageStyle} {...props}>
    {props.children}
  </div>
)

export const PHPageWithSection: React.FC<React.PropsWithChildren> = (props) => (
  <PHPage>
    <section style={{ width: '100%', minWidth: '100%' }}>{props.children}</section>
  </PHPage>
)
