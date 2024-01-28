import { css } from '@emotion/css'
import React from 'react'

import { PHLoading } from '@local/ui/component/element/phLoading'
import { PHPage } from '@local/ui/component/layout/phPage'

const topCenteredBoxStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
})

export const PHLoadingPage: React.FC<{ title?: string; description?: string }> = ({ title, description }) => {
  return (
    <PHPage>
      <div className={topCenteredBoxStyle}>
        {title && <h3>{title}</h3>}
        <h5>{description || '로딩 중이에요, 잠시만 기다려주세요...'}</h5>
        <PHLoading />
      </div>
    </PHPage>
  )
}
