import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { parse_host } from 'tld-extract';

import { OverlayTrigger, Tooltip, Form, Button } from 'react-bootstrap';

import { PHSpinnerButton } from 'src/ui/common/element/muButton';
import { PHFormText } from 'src/ui/common/element/muFormText';
import './account.css';

const getDomainUrlFromEmailAddress = (email: string) => {
  const address = email.split('@').pop();
  const parsedResult = parse_host(address);
  return parse_host(address).domain;
}

export const MailSentWelcomeToMuDev = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [welcomePageState, setWelcomePageState] = useState({
    goToMailDomain: undefined,
    mailDomain: undefined,
  });

  useEffect(() => {
    if (location?.state?.email) {
      try {
        const targetDomain = getDomainUrlFromEmailAddress(location.state.email);
        const targetUrl = 'https://' + targetDomain;

        setWelcomePageState({
          ...welcomePageState,
          mailDomain: targetDomain,
          goToMailDomain: (evt) => {
            try {
              if (evt && evt.type === 'mousedown' && evt.button === 0) {
                // If it's clicked by mouse left button
                window.location.href = targetUrl;
              } else if (evt && evt.type === 'mousedown' && evt.button === 1) {
                // If it's clicked by mouse middle button
                window.open(targetUrl, '_blank');
              } else if (evt && evt.type === 'mousedown') {
                // Ignore other mouse buttons
              } else {
                window.open(targetUrl, '_blank');
              }
            } catch (e1) { /* */ }
          }
        });
      } catch (e) { /* */ }
    }
  }, []);

  let welcomeString = '입력하신 주소로 메일을 보냈습니다,\n'
  welcomeString += '메일에 포함된 주소를 눌러 가입을 마무리 해주세요.\n'
  welcomeString += '메일이 전송되는데 30분 정도 걸릴 수 있어요.'

  return <section className='accountMain'>
    <header>
      <h2>계정 만들기</h2>
    </header>
    <aside className='accountAside'>
      <Form>
        <Form.Group className='accountAsideFormGroup' controlId='formBasicEmail'>
          <Form.Label>MUdev.cc에 오신 것을 환영합니다!</Form.Label>
          <PHFormText defaultChildren={welcomeString}></PHFormText><br />
        </Form.Group>

        <div className='accountSubmitBtnContainer'>
          <Button
            variant='outline-secondary'
            style={{
              color: 'var(--color)',
              border: '1px solid var(--color)',
            }}
            onClick={() => navigate('/')}>
            홈으로 가기
          </Button>
          <Button
            variant='primary'
            onClick={() => navigate('/account/signin')}>
            로그인하러 가기
          </Button>
        </div>
        {
          welcomePageState.goToMailDomain && <div className='accountSubBtnContainer'>
            <OverlayTrigger
              placement='bottom'
              overlay={(tooltipProps) => <Tooltip {...tooltipProps}>{welcomePageState.mailDomain}</Tooltip>} >
              <Button
                style={{ width: '100%' }}
                variant='outline-primary'
                onClick={welcomePageState.goToMailDomain}
                onMouseDown={welcomePageState.goToMailDomain}>
                이메일 주소의 도메인으로 가기<br />
                <small>(마우스 스크롤 버튼으로 새 탭에서 여세요!)</small>
              </Button>
            </OverlayTrigger>
          </div>
        }
      </Form>
    </aside>
  </section>;
}
