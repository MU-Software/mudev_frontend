import React from 'react';
import { useNavigate } from 'react-router-dom';

import { PHButton } from "src/ui/common/element/muButton";
import './main.css';

export const BCaMain = (props) => {
  const navigate = useNavigate();

  return <section className='bcaMain' {...props}>
  <header>
    <h2>B.Ca</h2>
    <p>명함 기반의 커뮤니케이션 메신저</p>
  </header>

  <PHButton onClick={() => navigate(-1)} variant='outline-success' size='medium'>뒤로 가기</PHButton>
  <PHButton onClick={() => navigate('/')} variant='success' size='medium'>홈으로 가기</PHButton>
</section>;
}
