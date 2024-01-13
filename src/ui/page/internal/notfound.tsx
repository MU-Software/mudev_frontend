import { css } from '@emotion/css'
import { useNavigate } from 'react-router-dom'

import { PHButton } from '@local/ui/component/element/phButton'
import { PHPage } from '@local/ui/component/layout/phPage'

const NotFoundPageStyle = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  height: '75%',
  width: '100%',
})

export const NotFoundMain = () => {
  const navigate = useNavigate()

  return (
    <PHPage>
      <div className={NotFoundPageStyle}>
        <h1>&nbsp;&nbsp;페이지를 찾을 수 없어요...</h1>
        <div>
          <PHButton variant="success" onClick={() => navigate(-1)}>
            뒤로 가기
          </PHButton>
          <PHButton variant="success" onClick={() => navigate('/')}>
            홈으로 가기
          </PHButton>
        </div>
        <code>404 Not Found</code>
      </div>
    </PHPage>
  )
}
