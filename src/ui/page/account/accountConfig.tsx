import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { OverlayTrigger, Tooltip, Spinner, Form, Button } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiAccountCircle } from '@mdi/js';

import { PHButton, PHSpinnerButton } from 'src/ui/common/element/muButton';
import { PHFormText } from 'src/ui/common/element/muFormText';
import { ListRow } from 'src/ui/common/element/muListRow';

import './accountConfig.css';

import { AccountNickIDChangeModal } from './modal/nickIdChangeModal';
import { AccountPasswordChangeModal } from './modal/passwordChangeModal';

const RequireSignedIn: React.FC = () => {
  const navigate = useNavigate();
  return <aside style={{ width: 'calc(var(--width-card) * 1.25)' }}>
    <header>
      <p>
        현재 로그인 된 상태가 아니에요,<br />
        계정 설정을 위해서는 로그인을 해 주세요.
      </p>
    </header>
    <PHButton
      onClick={() => navigate('/account/signin')}
      variant='info'
      size='medium'>
      로그인
    </PHButton>
  </aside>;
}

export const AccountConfig = () => {
  const [accountConfigState, setAccountConfigState] = useState({
    showNickIdChangeModal: false,
    showPasswordChangeModal: false,
  });
  const navigate = useNavigate();
  const accountInfo: AccountInfo = useSelector(state => state.accountReducer);
  const dispatch = useDispatch();

  return <section className='accountMain' >
    <AccountNickIDChangeModal
      modalShowState={accountConfigState.showNickIdChangeModal}
      setModalShowState={(newModalState: boolean) => setAccountConfigState({
        ...accountConfigState,
        showNickIdChangeModal: newModalState,
      })} />
    <AccountPasswordChangeModal
      modalShowState={accountConfigState.showPasswordChangeModal}
      setModalShowState={(newModalState: boolean) => setAccountConfigState({
        ...accountConfigState,
        showPasswordChangeModal: newModalState,
      })} />

    <header>
      <h2>계정 설정</h2>
    </header>

    {
      accountInfo.isFetching
        ? <><br /><br />
          <Spinner animation='border' role='status'>
            <span className='visually-hidden'>불러오는 중이에요...</span>
          </Spinner>
        </>
        : accountInfo.isSignedIn ? <aside className='accountConfigAside'>
          <div className='accountConfigProfileInfoContainer'>
            {/* User profile image / nickname / id / email */}
            <div
              className='accountConfigProfileImgContainer'
              title='프로필 이미지'
              onClick={() => alert('아직 준비 중이에요,\n조금만 기다려주세요ㅠㅜ')}>
              {
                accountInfo.img_url
                ? <img
                  className='accountConfigProfileImg'
                  alt='profile image'
                  src={accountInfo.img_url || 'https://picsum.photos/200/300'} />
                : <Icon path={mdiAccountCircle} size='10rem' />
              }
              <div className='accountConfigProfileImgChangeTextContainer'>
                이미지 변경
              </div>
            </div>
            <div className='accountConfigNickEmailContainer'>
              <h4 className='accountConfigNick' title='별칭'>
                {accountInfo.nick}&nbsp;
                <div className='accountConfigUuid' title='고유번호'>
                  #{accountInfo.uuid}
                </div>
              </h4>
              <p className='accountConfigId' title='아이디'>@{accountInfo.id}</p>
              <p title='이메일'>
                <div>
                  이메일 : {accountInfo.email}&nbsp;&nbsp;
                </div>
                <sup title='이메일 인증 여부' style={{ top: '0' }}>
                  {accountInfo.emailVerified ? '메일 인증됨' : '메일 인증되지 않음'}
                </sup>
              </p>
            </div>
          </div>
          <div className='accountConfigGoToBtnContainer'>
            <Button
              variant='link'
              onClick={() => setAccountConfigState({ ...accountConfigState, showNickIdChangeModal: true, })}
              className='accountConfigGoToBtn'>
              {/* Change id / nick */}
              아이디 / 별칭 변경
            </Button>
            <Button
              variant='link'
              onClick={() => setAccountConfigState({ ...accountConfigState, showPasswordChangeModal: true, })}
              className='accountConfigGoToBtn'>
              {/* Change password */}
              비밀번호 변경
            </Button>
            <Button
              variant='link'
              onClick={() => navigate('/account/deactivate')}
              className='accountConfigGoToBtn'>
              {/* Deactivate account */}
              계정 비활성화
            </Button>

          </div>
        </aside> : <RequireSignedIn />
    }

  </section >;
}
