import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Form, Button } from 'react-bootstrap';

import { PHSpinnerButton } from 'src/ui/common/element/muButton';
import { PHFormText } from 'src/ui/common/element/muFormText';
import './account.css';

export const AccountPasswordReset = () => {
  const navigate = useNavigate();
  const [accountPasswordResetFormData, setAccountPasswordResetFormData] = useState({
    isProcessing: false,
  });

  let descriptionString = '해당 이메일 주소와 연결된 계정이 있으면 계정의 비밀번호를 초기화할 수 있는 메일을 보내드려요.\n';
  descriptionString += '메일이 전송되는데 30분 정도 걸릴 수 있어요.';

  return <section className='accountMain'>
    <header>
      <h2>비밀번호 초기화</h2>
    </header>
    <aside className='accountAside'>
      <Form>
        <Form.Group className="accountAsideFormGroup" controlId="formBasicEmail">
          <Form.Label>가입 시 사용한 이메일 주소</Form.Label>
          <PHFormText defaultChildren={descriptionString}></PHFormText><br />
          <Form.Control type="email" placeholder="someone@example.com" /><br />
        </Form.Group>

        <div className='accountSubmitBtnContainer'>
          <Button
            variant='outline-secondary'
            style={{
              color: 'var(--color)',
              border: '1px solid var(--color)',
            }}
            onClick={() => navigate('/account/signin')}>
            로그인하러 가기
          </Button>

          <PHSpinnerButton
            variant='primary'
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
