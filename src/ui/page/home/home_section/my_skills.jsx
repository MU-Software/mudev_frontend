import React, { useState } from 'react';
import { Button } from "react-bootstrap";
import { Divider } from 'src/ui/common/element/divider';

import './introduce.css';

export const HomeMySkillsSection = props => {
  const [mySkillState, setMySkillState] = useState({
    backendDetailFold: true,
    backendWasSubDetailFold: true,
    backendLinuxSubDetailFold: true,
    backendAwsSubDetailFold: true,
    backendEtcSubDetailFold: true,

    frontendDetailFold: true,
    applicationDetailFold: true,
    pythonDetailFold: true,
    etcDetailFold: true,
  });
  const toggleDetails = (detailName) => (evt) => {
    evt.preventDefault();

    const keyName = `${detailName}DetailFold`;
    setMySkillState(prevState => ({ ...prevState, [keyName]: !prevState[keyName], }));
  };
  const isAllDetailsFolded = () => {
    let isAllValueFalse = true;
    const tempModalState = { ...mySkillState };
    for (const key in tempModalState)
      if (typeof (tempModalState[key]) === 'boolean' && tempModalState[key])
        if (isAllValueFalse) isAllValueFalse = false;

    return isAllValueFalse;
  };
  const toggleAllDetails = () => {
    const isAllValueFalse = isAllDetailsFolded();

    setMySkillState(prevState => ({
      ...prevState,

      backendDetailFold: isAllValueFalse,
      backendWasSubDetailFold: isAllValueFalse,
      backendLinuxSubDetailFold: isAllValueFalse,
      backendAwsSubDetailFold: isAllValueFalse,
      backendEtcSubDetailFold: isAllValueFalse,

      frontendDetailFold: isAllValueFalse,
      applicationDetailFold: isAllValueFalse,
      pythonDetailFold: isAllValueFalse,
      etcDetailFold: isAllValueFalse,
    }));
  };

  return <section className='homeIntroduceSection' id='skills'>
    <header>
      <h2>Skills</h2>
      <p>
        저는 가능한 많은 경험으로 배우고 성장하려 노력합니다.<br />
        아래의 몇몇 경험들은 제 취미로 진행한 것으로 서로 연관이 없어 보일 수 있지만,
        <ul>
          <li>Python으로 웹 사이트 파서를 작성하면서 멀티 스레드 / 멀티 프로세싱과 이에 맞는 디자인 패턴을 배웠고</li>
          <li>AVR MCU와 ESP32와 같은 임베디드 환경에서 코드를 작성하며 최적화를 진지하게 고민하게 되었으며</li>
          <li>3D 모델 뷰어를 작성하며 자연스레 브라우저의 CSSOM과 DOM을 이해하게 되는 등</li>
        </ul>
        다양한 경험은 저의 안목과 식견을 넓히는 기회가 되었다고 생각합니다.
      </p>
    </header>
    <Divider style={{ margin: '1rem' }} />

    <small style={{ color: 'var(--color-75)' }}>
      각 제목을 클릭 시 접거나 펼칠 수 있습니다. <a onClick={toggleAllDetails} className='homeSkillsFoldBtn'>
        전부 {isAllDetailsFolded() ? '펼치시려면' : '접으시려면'} 여기를 눌러주세요.</a>
    </small>

    <article className='homeIntroduceArticle homeSkillsArticle'>
      <aside>
        <details open={mySkillState.backendDetailFold} style={{ margin: '.5rem' }}>
          <summary
            className='homeSkillsDetailsSummary'
            style={{ fontSize: '1.5rem' }}
            onClick={toggleDetails('backend')}>
            <h5>백엔드 개발</h5>
          </summary>
          <p>
            <ul>
              <li>
                <details open={mySkillState.backendWasSubDetailFold} style={{ margin: '.5rem' }}>
                  <summary
                    className='homeSkillsDetailsSummary'
                    style={{ fontSize: '1.25rem' }}
                    onClick={toggleDetails('backendWasSub')}>
                    <h6>애플리케이션 서버&#40;WAS&#41;</h6>
                  </summary>
                  <ul>
                    <li>
                      API가 RESTful하게 설계한다는 것에 대해 깊은 이해를 하고 있으며,<br />
                      Flask로 RESTful한 API 서버를 구축할 수 있습니다.
                    </li>
                    <li>
                      JWT이 무엇인지 알고 있으며, Refresh Token + Access Token을 사용한 인증 시스템을 구축할 수 있습니다.<br />
                      이 사이트 또한 Refresh Token과 Access Token을 사용하여 인증하고 있습니다.
                    </li>
                    <li>HTTP Cookie와 이것의 속성인 HTTP Only와 Secure에 대해 알고 있습니다.</li>
                    <li>
                      SQLite나 PostgreSQL 등의 RDB나 Redis같은 In-memory 데이터 스토어를 사용하고,<br />
                      ORM 또는 Raw SQL을 사용할 수 있습니다.
                    </li>
                  </ul>
                </details>
              </li>
              <li>
                <details open={mySkillState.backendLinuxSubDetailFold} style={{ margin: '.5rem' }}>
                  <summary
                    className='homeSkillsDetailsSummary'
                    style={{ fontSize: '1.25rem' }}
                    onClick={toggleDetails('backendLinuxSub')}>
                    <h6>Linux</h6>
                  </summary>
                  <ul>
                    <li>Debian 기반의 Linux를 주로 다룹니다.</li>
                    <li>Linux Mint 20으로 SAMBA/NFS 서버를 직접 구축해서 사용하고 있습니다.</li>
                    <li>
                      APT/DPKG 등의 패키지 매니저를 사용하며,<br />
                      의존성 꼬임 등의 문제에 대처할 수 있습니다.
                    </li>
                    <li>기본적인 Bash 셸 스크립트을 작성할 수 있습니다.</li>
                    <li>POSIX 기반의 C 언어를 사용한 소켓 프로그래밍을 할 수 있습니다.</li>
                  </ul>
                </details>
              </li>
              <li>
                <details open={mySkillState.backendAwsSubDetailFold} style={{ margin: '.5rem' }}>
                  <summary
                    className='homeSkillsDetailsSummary'
                    style={{ fontSize: '1.25rem' }}
                    onClick={toggleDetails('backendAwsSub')}>
                    <h6>AWS</h6>
                  </summary>
                  <ul>
                    <li>
                      Amazon Web Service의 EC2, RDS, ElastiCache, SQS, Lambda를 사용해본 적이 있습니다.<br />
                      또한, 위 자원들을 Python의 Boto3 라이브러리를 통해 제어할 수 있습니다.
                    </li>
                    <li>
                      AWS SQS나 AWS S3의 트리거로 AWS Lambda를 호출할 수 있습니다.<br />
                      예를 들면, 후술할 프로젝트인 B.Ca에서 과거에는 오래 걸리는 작업을 SQS의 FIFO 큐에 푸시하고,<br />
                      Lambda에서 Pull하여 작업을 처리하는 구성을 사용했었습니다.<br />
                      (현재는 AWS 종속성을 없애는 과정에서 Celery와 Redis로 해당 기능을 이관했습니다.)
                    </li>
                    <li>AWS Lambda와 API Gateway를 사용한 Serverless 아키텍처를 구성할 수 있습니다.</li>
                  </ul>
                </details>
              </li>
              <li>
                <details open={mySkillState.backendEtcSubDetailFold} style={{ margin: '.5rem' }}>
                  <summary
                    className='homeSkillsDetailsSummary'
                    style={{ fontSize: '1.25rem' }}
                    onClick={toggleDetails('backendEtcSub')}>
                    <h6>그 외</h6>
                  </summary>
                  <ul>
                    <li>NGINX로 리버스 프록시를 구성할 수 있습니다.</li>
                    <li>
                      Google API를 통해 Gmail로 메일을 전송할 수 있습니다.<br />
                      예시로, 이 사이트는 회원가입 또는 비밀번호 초기화 시 해당 방식으로 메일을 전송합니다.
                    </li>
                    <li>Firebase Cloud Messaging을 통해 특정 사용자에게 메시지를 푸시할 수 있습니다.</li>
                  </ul>
                </details>
              </li>
            </ul>
          </p>
        </details>
      </aside>

      <aside>
        <details open={mySkillState.frontendDetailFold} style={{ margin: '.5rem' }}>
          <summary
            className='homeSkillsDetailsSummary'
            style={{ fontSize: '1.25rem' }}
            onClick={toggleDetails('frontend')}>
            <h5>프론트엔드 개발</h5>
          </summary>
          <p>
            <ul>
              <li>
                기본적인 HTML과 CSS, JavaScript를 사용할 수 있으며,<br />
                용도에 맞는 HTML 태그 사용을 지향합니다.
              </li>
              <li>
                React(+JSX)와 Redux를 능숙하게 사용합니다.<br />
                이 사이트도 React 함수형 컴포넌트로 UI를 작성하고 React Hook로 컴포넌트별 상태를 관리하며,<br />
                Redux를 사용하여 사이트 전체 로그인 상태를 관리하도록 작성했습니다.
              </li>
              <li>
                가능한 TypeScript로 타입을 명시하려 하며,<br />
                JavaScript로 개발된 사이트를 TypeScript로 전환할 수 있습니다.
              </li>
              <li>Yarn과 Yarn Berry 사용을 선호합니다.</li>
            </ul>
          </p>
        </details>
      </aside>

      <aside>
        <details open={mySkillState.applicationDetailFold} style={{ margin: '.5rem' }}>
          <summary
            className='homeSkillsDetailsSummary'
            style={{ fontSize: '1.25rem' }}
            onClick={toggleDetails('application')}>
            <h5>애플리케이션 개발</h5>
          </summary>
          <p>
            <ul>
              <li>
                Java로 안드로이드 네이티브 앱 개발을 할 수 있으며,<br />
                졸업 작품에 Android Jetpack을 사용하여 앱을 개발했습니다.
              </li>
              <li>LiveData와 ViewModel을 사용해서 MVVM 디자인 패턴으로 앱을 설계하고 개발할 수 있습니다.</li>
              <li>Flutter로 크로스플랫폼 앱 개발을 할 수 있습니다.</li>
              <li>교수님께 실력을 인정받아 4학년 2학기에 &lt;안드로이드 프로그래밍(JAVA)&gt; 조교로 근무했습니다.</li>
            </ul>
          </p>
        </details>
      </aside>

      <aside>
        <details open={mySkillState.pythonDetailFold} style={{ margin: '.5rem' }}>
          <summary
            className='homeSkillsDetailsSummary'
            style={{ fontSize: '1.25rem' }}
            onClick={toggleDetails('python')}>
            <h5>Python</h5>
          </summary>
          <p>
            <div className='homeSkillsArticlePythonDescription'>
              Python은 제 최애 언어라고 할 수 있을 정도로 관심이 많고 자주 사용하는 언어입니다.
              그만큼 새로운 Python 관련 소식을 적극적으로 챙겨보기도 하고,
              Python의 느린 함수 호출 속도 등과 같은 단점에 대해서도 알고 있으며,
              Python의 장점으로 더 좋은 코드를 작성할 수 있을지 고민하기도 합니다.
            </div>
            <ul>
              <li>Flask를 사용해서 RESTful한 웹 애플리케이션 서버를 작성할 수 있습니다.</li>
              <li>magic method, metaclass, decorator 등을 이해하고 적절한 곳에 사용합니다.</li>
              <li>Type hint를 적용하는 법을 알고 프로젝트에 적극적으로 사용합니다.</li>
              <li>
                반복적인 문제 해결을 위해 Python으로 CLI 도구를 만들 수 있습니다.<br />
                예시로, 제 백엔드에서는 아래와 같은 도구를 작성해서 사용하고 있습니다.
                <ul>
                  <li>OpenAPI 문서를 생성하는 도구</li>
                  <li>SQLAlchemy ORM으로 작성된 DB 테이블의 <abbr title='Entity Relationship Diagram'>ERD</abbr>를 생성하는 도구</li>
                  <li>JSON으로 작성된 환경변수 컬렉션을 Bash, PowerShell, ENV 파일 등 여러 타입으로 내보내는 도구</li>
                </ul>
              </li>
              <li>
                Walrus 연산자와 match-case 구문 등 Python에 최근 추가된 문법에 대해 알고 있으며,<br />
                실제로 Walrus는 이 사이트의 백엔드에 사용되고 있습니다.</li>
              <li>C 언어 단에서 Py_INCREF와 Py_DECREF 매크로 등을 직접 사용해보면서 Python이 내부적으로 메모리를 관리하는 방법을 알고 있습니다.</li>
              <li>C 애플리케이션에 CPython의 dll과 ctypes를 통한 임베딩을 통해 C 함수를 Python에서 호출하거나 Python 객체를 C에서 사용해본 경험이 있습니다.</li>
              <li>PyCon과 같은 컨퍼런스를 자주 챙겨봅니다.</li>
            </ul>
          </p>
        </details>
      </aside>

      <aside>
        <details open={mySkillState.etcDetailFold} style={{ margin: '.5rem' }}>
          <summary
            className='homeSkillsDetailsSummary'
            style={{ fontSize: '1.25rem' }}
            onClick={toggleDetails('etc')}>
            <h5>그 외</h5>
          </summary>
          <p>
            <ul>
              <li>Git을 사용할 줄 알고, Branch 등을 사용할 수 있습니다.</li>
              <li>AVR 8비트 MCU를 다룰 줄 알며, ATmega2560의 <abbr title='eXternal MEMory Interface'>XMEM 인터페이스</abbr>로 <abbr title='AY-3-8910 Programmable Sound Generator(PSG)'>과거 80년대를 풍미한 음원칩</abbr>을 제어할 수 있습니다.</li>
              <li>SDL2와 OpenGL 3로 간단한 3D 렌더러를 만들 줄 알며, 이것을 WASM으로 빌드해서 최신 웹 브라우저에서 실행시킬 수 있습니다.</li>
            </ul>
          </p>
        </details>
      </aside>
    </article>
  </section>;
};
