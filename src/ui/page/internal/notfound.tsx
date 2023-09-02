import { useNavigate } from 'react-router-dom';

import { PHButton } from '@ui/component/element/phButton';
import './notfound.css';

export const NotFoundMain = () => {
  const navigate = useNavigate();

  return <div className='notFoundPageContainer'>
    <div className='dummyPlacer' />
    <div className='notFoundPage'><h1>페이지를 찾을 수 없어요...</h1></div>
    <div>
      <PHButton variant='success' onClick={() => navigate(-1)}>뒤로 가기</PHButton>
      <PHButton variant='success' onClick={() => navigate('/')}>홈으로 가기</PHButton>
    </div>
    <code>404 Not Found</code>
  </div>;
}
