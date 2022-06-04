import React from 'react';
import Icon from '@mdi/react';
import { mdiEmailOutline, mdiTwitter, mdiGithub, mdiPhone } from '@mdi/js';

import { Divider } from 'src/ui/common/element/divider';

import './introduce.css';

export const HomeIntroduceSection = props => {
  return <section className='homeIntroduceSection' id='introduce'>
    <header>
      <h2>Introduce</h2>
    </header>
    <Divider style={{ marginTop: '2rem' }} />
    <article className='homeIntroduceArticle'>
      <article className='homeIntroduceMySelf'>
        <h5>저를 소개합니다.</h5>
        <p>저는 웹/앱/임베디드/그래픽스 등 분야를 가리지 않고 컴퓨터와 관련된 많은 것들을 사랑하는 개발자입니다.</p>
        <p>
          개발과 관련된 대화를 나누기 위해 매년 PyCon KR이나 AWS Summit에 참가하고,
          최신 기술 트렌드를 알기 위해 Hacker News나 GeekNews를 매일 확인하거나 Google I/O, Toss Slash 등의 컨퍼런스를 챙겨보는 것을 좋아하며,
          그렇게 익힌 기술 트렌드를 실제 코드에 적용하면서 이러한 트렌드가 유행하는 이유를 추측해보고 해당 트렌드의 장단점을 직접 느끼는 것을 좋아합니다.
          {/* </p>
      <p> */}
          <br />
          <br />
          실제로 이 사이트도...
          <ul>
            <li>Python의 Type-hint와 TypeScript등 정적 타이핑을 적극적으로 사용하고</li>
            <li>백엔드 API 프레임워크에서의 선언 한 번으로 요청의 Header나 Body의 필드를 검사하고 OpenAPI 문서를 자동으로 생성하는 등</li>
          </ul>
          최근 트렌드를 반영해보면서 이것이 트렌드가 된 이유를 직접 배우고 느꼈습니다.
        </p>
      </article>
      <article className='homeIntroduceLinkArticle'>
        <h5>연락처 &#38; 링크</h5>
        <div className='homeIntroduceLinkContainer'>
          <a href='mailto:musoftware@mudev.cc' className='homeIntroduceLink'>
            <aside className='homeIntroduceLinkBox homeIntroduceLinkBoxGmail'>
              <Icon className='homeIntroduceLinkIcon' path={mdiEmailOutline} alt='Mail to MUsoftware' />
              <div className='homeIntroduceLinkTextBox'>
                Mail<br /><small>musoftware@mudev.cc</small>
              </div>
            </aside>
          </a>
          <a href='mailto:musoftware@daum.net' className='homeIntroduceLink'>
            <aside className='homeIntroduceLinkBox homeIntroduceLinkBoxKakaoMail'>
              <Icon className='homeIntroduceLinkIcon' path={mdiEmailOutline} alt='Mail to MUsoftware' />
              <div className='homeIntroduceLinkTextBox'>
                보조 Mail<br /><small>musoftware@daum.net</small>
              </div>
            </aside>
          </a>
          <a href='https://twitter.com/MUsoftware' className='homeIntroduceLink'>
            <aside className='homeIntroduceLinkBox homeIntroduceLinkBoxTwitter'>
              <Icon className='homeIntroduceLinkIcon' path={mdiTwitter} alt='Go to MUsoftware twitter account' />
              <div className='homeIntroduceLinkTextBox'>
                Twitter<br /><small>@MUsoftwareKR</small>
              </div>
            </aside>
          </a>
          <a href='https://github.com/MU-Software' className='homeIntroduceLink'>
            <aside className='homeIntroduceLinkBox'>
              <Icon className='homeIntroduceLinkIcon' path={mdiGithub} alt='Go to MUsoftware Github Page' />
              <div className='homeIntroduceLinkTextBox'>
                Github<br /><small>MU-Software</small>
              </div>
            </aside>
          </a>
        </div>
      </article>
      <article className='homeIntroduceEducated'>
        <h5>학력</h5>
        <ul>
          <li className='homeIntroduceEducatedListItem'>
            [ 2013. 3 - 2016. 2 (졸업)]
            <div className='homeIntroduceEducatedSchoolName'>
              경기 안산 고잔고등학교
            </div>
          </li>
          <li className='homeIntroduceEducatedListItem'>
            [ 2016. 3 - 2022. 2 (졸업)]
            <div className='homeIntroduceEducatedSchoolName'>
              한신대학교 컴퓨터공학부
            </div>
          </li>
        </ul>
      </article>
    </article>
  </section>;
}
