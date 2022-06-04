import React from 'react';
import GitHubButton from 'react-github-btn';
import { Divider } from 'src/ui/common/element/divider';
import { ListRow } from 'src/ui/common/element/muListRow';

import './introduce.css';
import './projects.css';

const ProjectDescRow: () => React.FC = (props: {
  projectName: string;
  projectAs?: string;
  projectPart?: string;
  projectPeriod: string;
  additionalClass?: string;
} & defaultProps) => <div className={`projectDescRow ${props.additionalClass ?? ''}`}>
    <header className='projectDescTitle'>
      <h4 className='projectName'>{props.projectName}</h4>
      {props.projectAs && <p className='projectAs'>{props.projectAs}</p>}
      {props.projectPart && <p className='projectPart'>{props.projectPart}</p>}
      <p className='projectPeriod'>{props.projectPeriod}</p>
    </header>
    <div className='projectDescBody'>
      {props.children}
    </div>
  </div>;

const TechStackTag: () => React.FC = (props: {
  bgColor: string;
  textColor?: string;
  techName: string;
}) => <sup
  className='projectTechStackTag'
  style={{
    backgroundColor: props.bgColor,
    color: props.textColor ?? 'rgba(255, 255, 255, 1)',
  }} >
    {props.techName}
  </sup>;

const MuGithubButton: () => React.FC = (props: {
  repoName: string;
  btnText?: string;
  icon?: string;
  small?: boolean;
  disableHighContrast?: boolean;
  generateTemplate?: boolean;
}) => {
  let colorScheme = 'no-preference: light_high_contrast; ';
  colorScheme += 'light: light_high_contrast; ';
  colorScheme += 'dark: light_high_contrast; ';

  const hrefResult = `https://github.com/${props.repoName}/${props.generateTemplate ? 'generate' : ''}`;

  return <div className='projectGithubBtn'>
    <GitHubButton
      data-color-scheme={props.disableHighContrast ? false : colorScheme}
      data-size={props.small ? false : 'large'}
      data-icon={props.icon ?? false}
      href={hrefResult}>
      {`\u00A0${props.btnText ?? props.repoName}`}
    </GitHubButton>
  </div>;
}

export const HomeProjectsByMUSection = props => {
  return <section className='homeIntroduceSection homeProjectsSection' id='projects'>
    <header>
      <h2>프로젝트</h2>
    </header>
    <Divider style={{ marginTop: '2rem' }} />

    <article className='homeProjectsArticle'>
      <ProjectDescRow
        projectName='Frost'
        projectAs='개인 프로젝트'
        projectPeriod='2020.12 - 진행 중' >
        <p className='projectDescParagraph'>
          <abbr title='Flask based Restful Oriented Server Template'>Frost</abbr>는 Flask 기반의 REST API 서버 템플릿입니다.<br />
          이 템플릿은...
          <ul>
            <li>Python의 Decorator를 활용한 API 요청 필드 검증 및 라우트 문서화</li>
            <li>JWT를 사용한 Refresh/Access Token 인증 기반 Stateless 서버</li>
            <li>이메일을 통한 계정 인증과 비밀번호 초기화 기능</li>
            <li>강제 토큰 무효화 (강제로 사용자 로그아웃)</li>
            <li>OpenAPI 3.0 YAML 규격으로 API 문서 생성</li>
            <li>명세된 ORM 테이블로 ER 다이어그램 생성</li>
          </ul>
          등을 지원하며, 현재 제 많은 프로젝트에서 백엔드로 사용되고 있습니다.
        </p>

        <h5>기술 스택 (백엔드)</h5>
        <div className='projectTechStackTagContainer'>
          <TechStackTag bgColor='#306998' textColor='#FFD43B' techName='Python' />
          <TechStackTag bgColor='#000000' techName='Flask' />
          <TechStackTag bgColor='#d71f00' techName='SQLAlchemy' />
          <TechStackTag bgColor='#336791' techName='PostgreSQL' />
          <TechStackTag bgColor='#dc382c' techName='Redis' />
          <TechStackTag bgColor='#173647' textColor='#85ea2d' techName='OpenAPI 3.0' />
        </div>
        <br />

        <h5>링크 (저장소)</h5>
        <MuGithubButton
          repoName='MU-Software/frost' />
        <MuGithubButton
          generateTemplate
          icon='octicon-repo-template'
          repoName='MU-Software/frost'
          btnText='이 템플릿으로 새 저장소 만들기' />
      </ProjectDescRow>
      <ProjectDescRow
        projectName='B.Ca'
        projectAs='학사 졸업 작품'
        projectPart='Android 앱 및 백엔드 개발'
        projectPeriod='2021.04 - 2021.12' >
        <p className='projectDescParagraph'>
          B.Ca는 학사 졸업 작품으로 진행한 프로젝트로,<br />
          디자인 / QA / 서류 작업을 담당한 김호준 학우와 같이 진행했습니다.<br />
          저는 이 프로젝트에서 Android 네이티브 앱 개발과 백엔드 개발을 담당했습니다.<br />
          <br />
          B.Ca는 디지털 명함 기반의 커뮤니케이션 메신저 서비스로,<br />
          <ul>
            <li>REST API를 통해 사용자의 프로필/명함이나 채팅과 같은 자원 CRUD 가능</li>
            <li>오프라인 지원을 위해 클라이언트에서 필요한 자원을 전부 포함한 동기화 DB를 서버에서 생성 후 푸시</li>
            <li>위의 동기화 DB를 서버에서 생성 및 수정 시 Celery와 Redis를 통한 비동기 작업 처리</li>
            <li>Firebase Cloud Messaging을 통한 실시간 채팅 지원</li>
          </ul>
          과 같은 기능을 가지고 있습니다.
        </p>

        <h5 style={{ margin: '0' }}>기술 스택</h5>
        <ul style={{ margin: '0' }}>
          <li>
            Android 애플리케이션
            <div className='projectTechStackTagContainer'>
              <TechStackTag bgColor='#3DDC84' textColor='#073042' techName='Android' />
              <TechStackTag bgColor='#073042' textColor='#3DDC84' techName='Android Jetpack' />
              <TechStackTag bgColor='#5382A1' textColor='#FFA518' techName='Java' />
              <TechStackTag bgColor='#003b57' textColor='#97d9f6' techName='SQLite' />
              <TechStackTag bgColor='#ffcb2e' textColor='#ef6c00' techName='Firebase Cloud Messaging' />
            </div>
          </li>
          <li>
            백엔드
            <div className='projectTechStackTagContainer'>
              <TechStackTag bgColor='royalblue' techName='Frost' />
              <TechStackTag bgColor='#a9cc54' textColor='#3e4349' techName='Celery' />
              <TechStackTag bgColor='#003b57' textColor='#97d9f6' techName='SQLite' />
              <TechStackTag bgColor='#ffcb2e' textColor='#ef6c00' techName='FCM' />
            </div>
          </li>
        </ul>

        <br />
        <h5 style={{ margin: '0' }}>링크</h5>
        <ul style={{ margin: '0' }}>
          <li>
            Android 애플리케이션 저장소<br />
            <MuGithubButton repoName='MU-Software/bca_android' />
          </li>
          <li>
            백엔드 저장소<br />
            <MuGithubButton repoName='MU-Software/bca_backend' />
          </li>
        </ul>
      </ProjectDescRow>
      <ProjectDescRow
        projectName='MUdev.cc'
        projectAs='개인 프로젝트'
        projectPeriod='2021.12 - 2022.05' >
        <p className='projectDescParagraph'>
          MUdev.cc는 제 개인 사이트로 기획된 프로젝트로, 현재 보고 계신 이 사이트입니다.<br />
          프론트엔드 디자인은 React-Bootstrap과 MVP.CSS에 조금 <del>많은</del> 수정을 거쳐서 만들어졌으며,
          백엔드도 Frost에 약간의 수정을 거쳐서 작성되었고,<br />
          현재 Vultr 서버에서 서비스되고 있습니다.<br />
          하위 프로젝트로 아래의 PlayCo가 있으며, 현재 추가로 기획 중인 서비스가 있습니다.
        </p>
        <h5 style={{ margin: '0' }}>기술 스택</h5>
        <ul style={{ margin: '0' }}>
          <li>
            프론트엔드
            <div className='projectTechStackTagContainer'>
              <TechStackTag bgColor='#20232a' textColor='#61dbfb' techName='React' />
              <TechStackTag bgColor='#764abc' techName='Redux' />
              <TechStackTag bgColor='#f0db4f' textColor='#323330' techName='JavaScript' />
              <TechStackTag bgColor='#3178c6' techName='TypeScript' />
            </div>
          </li>
          <li>
            백엔드
            <div className='projectTechStackTagContainer'>
              <TechStackTag bgColor='#69b53f' techName='linux mint' />
              <TechStackTag bgColor='#009639' techName='NGINX' />
              <TechStackTag bgColor='#499848' techName='Gunicorn' />
              <TechStackTag bgColor='royalblue' techName='Frost' />
              <TechStackTag bgColor='#003b57' textColor='#97d9f6' techName='SQLite' />
            </div>
          </li>
        </ul>

        <br />
        <h5 style={{ margin: '0' }}>링크</h5>
        <ul style={{ margin: '0' }}>
          <li>
            프론트엔드 저장소<br />
            <MuGithubButton repoName='MU-Software/mudev_frontend' />
          </li>
          <li>
            백엔드 저장소<br />
            <MuGithubButton repoName='MU-Software/mudev_backend' />
          </li>
        </ul>
      </ProjectDescRow>
      <ProjectDescRow
        additionalClass='lastItem'
        projectName='PlayCo'
        projectAs='개인 프로젝트'
        projectPeriod='2022.02 - 2022.05' >
        <p className='projectDescParagraph'>
          PlayCo는 MUdev.cc의 일부로 기획된 프로젝트 중 하나로,
          <ul>
            <li>YouTube 재생목록이 특정 상황에서 의도하지 않게 중복된 영상을 담게 되는 오류</li>
            <li>영상의 반복 설정 등이 어렵다는 점</li>
            <li>다른 사람과 재생목록을 같이 듣고 싶은데, 상대방이 무엇을 듣는지 알수 없다는 점</li>
          </ul>
          등에서 불편함을 겪어 간단하게 사용하고자 만든 서비스입니다.
          <br /><br />

          이 서비스를 통해...
          <ul>
            <li>REST API로 재생목록에 추가/삭제하거나 타인의 CRUD 가능 여부를 설정할 수 있고</li>
            <li>Socket.IO를 통해 재생목록의 설정 변경 &amp; 아이템 추가/삭제 등의 이벤트 수신 가능하며</li>
            <li>역시 Socket.IO를 통해 현재 누가 재생목록의 몇 번째 영상을 보는지 여부도 수신할 수 있습니다.</li>
          </ul>
        </p>

        <h5 style={{ margin: '0' }}>기술 스택</h5>
        <ul style={{ margin: '0' }}>
          <li>
            프론트엔드
            <div className='projectTechStackTagContainer'>
              <TechStackTag bgColor='#20232a' textColor='#61dbfb' techName='React' />
              <TechStackTag bgColor='#3178c6' techName='TypeScript' />
              <TechStackTag bgColor='#010101' techName='Socket.IO' />
            </div>
          </li>
          <li>
            백엔드
            <div className='projectTechStackTagContainer'>
              <TechStackTag bgColor='royalblue' techName='Frost' />
              <TechStackTag bgColor='#dc382c' techName='Redis' />
              <TechStackTag bgColor='#010101' techName='Flask-SocketIO' />
            </div>
          </li>
        </ul>

        <br />
        <h5 style={{ margin: '0' }}>링크</h5>
        <ul style={{ margin: '0' }}>
          <li>프론트엔드 : 위의 MUdev.cc를 참고해주세요.</li>
          <li>백엔드 : 역시 위의 MUdev.cc를 참고해주세요.</li>
        </ul>
      </ProjectDescRow>
    </article>
  </section>;
}
