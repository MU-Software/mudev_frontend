import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { parse_host } from 'tld-extract';

import { OverlayTrigger, Tooltip, Form, Button } from 'react-bootstrap';

import { PHSpinnerButton } from 'src/ui/common/element/muButton';
import { PHFormText } from 'src/ui/common/element/muFormText';
import './account.css';

export const AccountPasswordChange = () => {
  const navigate = useNavigate();

  return <section className='accountMain'>
    <header>
      <h2>비밀번호 변경</h2>
    </header>
    <aside className='accountAside'>
      <Form>
        <Form.Group className="accountAsideFormGroup" controlId="formBasicEmail">
          <Form.Label>현재 비밀번호</Form.Label>
          <PHFormText defaultChildren={descriptionString}></PHFormText><br />
          <Form.Control type="password" placeholder="someone@example.com" /><br />
        </Form.Group>

        <Form.Group className="accountAsideFormGroup" controlId="formBasicEmail">
          <Form.Label>새 비밀번호</Form.Label>
          <PHFormText defaultChildren={descriptionString}></PHFormText><br />
          <Form.Control type="email" placeholder="someone@example.com" /><br />
        </Form.Group>

        <Form.Group className="accountAsideFormGroup" controlId="formBasicEmail">
          <Form.Label>새 비밀번호 확인</Form.Label>
          <PHFormText defaultChildren={descriptionString}></PHFormText><br />
          <Form.Control type="email" placeholder="someone@example.com" /><br />
        </Form.Group>

        <div className='accountSubmitBtnContainer'>
          <Button
            variant="outline-light"
            onClick={() => navigate('/account/signin')}>
            로그인하러 가기
          </Button>

          <PHSpinnerButton
            variant='info'
            type='submit'
            size={false}
            style={{ margin: undefined }}
            onClick={() => {
              setAccountPasswordResetFormData({
                ...accountPasswordResetFormData,
                isProcessing: true,
              });
              setTimeout(() => {
                setAccountPasswordResetFormData({
                  ...accountPasswordResetFormData,
                  isProcessing: false,
                });
                alert('해당 이메일 주소와 연결된 계정이 있다면,\n비밀번호 초기화 메일이 전송돼요.\n해당 메일에서 계속 진행해주세요!');
                navigate('/account/signin');
              }, 5000);
            }}
            showSpinner={accountPasswordResetFormData.isProcessing}>
            비밀번호 초기화
          </PHSpinnerButton>
        </div>
      </Form>
    </aside>
  </section>;
}
