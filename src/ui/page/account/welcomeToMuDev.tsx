import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import './account.css';

export const WelcomeToMuDev = () => {
  const navigate = useNavigate();

  return <section className='accountMain'>
    <header>
      <h2>계정 만들기</h2>
    </header>
    <aside className='accountAside'>
      <Form>
        <Form.Group className='accountAsideFormGroup' controlId='formBasicEmail'>
          <Form.Label>MUdev.cc에 오신 것을 환영합니다!</Form.Label><br />
        </Form.Group>

        <div className='accountSubmitBtnContainer'>
          <>&nbsp;</>
          <Button
            variant='primary'
            onClick={() => navigate('/')}>
            홈으로 가기
          </Button>
        </div>
      </Form>
    </aside>
  </section>;
};
