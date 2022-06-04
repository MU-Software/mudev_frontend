import React from 'react';
import Icon from '@mdi/react';
import { mdiPost } from '@mdi/js';

import './blogRoot.css';

export const BlogRoot = () => {
  return <section className='blogRoot'>
    <aside className='blogBody'>
      <header>
        <h2>
          <Icon path={mdiPost} size='36pt' />&nbsp;블로그는 아직 준비되지 않았어요, 나중에 와 주세요...
        </h2>
        <p>글감은 쪼매 있는데, 쓸 의지와 시간, 그리고 필력이...</p>
      </header>

      <h5>언젠간 쓰고 싶은 주제</h5>
      <ul>
        <li>Web Extension 개발(Chrome 확장의 그것)</li>
        <li>Modern OpenGL 및 렌더 엔진</li>
        <li>JWT</li>
        <li>ATmega2560의 XMEM 인터페이스와 SRAM & AY-3-8910</li>
      </ul>
    </aside>
  </section>
}
