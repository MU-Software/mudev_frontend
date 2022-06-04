import React from 'react';
import { useNavigate } from 'react-router-dom'

import { PHButton } from 'src/ui/common/element/muButton';
import './main.css';

export const ToolMain: React.FC = props => {
  const navigate = useNavigate();

  return <section className='toolMain' {...props}>
    <header>
      <h2>Tools</h2>
      <p>내가 <del>가지고 놀려고</del> 쓰려고 만든 도구들</p>
    </header>
    <div>
      <aside>
        <h4>네트워크 패킷 파서</h4>
        <p className='toolLibUsedContainer'>
          <sup className='toolLibUsed'>Flask</sup>
          <sup className='toolLibUsed'>MVP.css</sup>
          <sup className='toolLibUsed'>TCP/UDP</sup>
        </p>
        <p>
          학부 과제용으로 만들었던,<br />
          간단한 네트워크 패킷 파서입니다.<br />
          웬만하면 갓 Wireshark를 쓰세요(...)<br />
        </p>
        <br />
        <PHButton variant='success' onClick={() => navigate('/tool/network-protocol-parser')} >이동 ↗</PHButton>
      </aside>
      <aside>
        <h4>QR코드 디코더</h4>
        <p>
          <sup className='toolLibUsed'>Emscripten</sup>
          <sup className='toolLibUsed'>WebAssembly</sup>
        </p>
        <p>
          클립보드의 이미지를 <kbd>Ctrl</kbd>+<kbd>V</kbd>로 붙여넣을 수 있는 디코더는 안 보여서
          WASM 연습 겸 만들었습니다.
        </p>
        <br />
        <PHButton variant='success' onClick={() => navigate('/tool/qrdecode')} >이동 ↗</PHButton>
      </aside>
    </div>
  </section>;
}
