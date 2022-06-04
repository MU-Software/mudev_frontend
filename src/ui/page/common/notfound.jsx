import React from 'react';
import { useNavigate } from 'react-router-dom';

import { PHButton } from 'src/ui/common/element/muButton';
import './notfound.css'

export const NotFound = () => {
  const navigate = useNavigate();

  return <div className='notFoundPageContainer'>
    <div className='dummyPlacer' />
    <div className='notFoundPage'>
      <h1>페이지를 찾을 수 없어요...</h1>
      <PHButton variant='success' onClick={() => navigate(-1)} size='medium'>뒤로 가기</PHButton>
      <PHButton variant='success' onClick={() => navigate('/')} size='medium'>홈으로 가기</PHButton>
      <br />
    </div>
    <code>404 Not Found</code>
  </div>;
}
