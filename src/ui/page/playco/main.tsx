import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { refreshAccessTokenActionCreatorAsync } from 'src/redux/modules/account/action_creator';
import { AccountInfo } from 'src/redux/modules/account/model';

import Icon from '@mdi/react';
import { mdiPlus, mdiCheckBold, mdiDeleteCircle, mdiRefresh } from '@mdi/js';
import { OverlayTrigger, Tooltip, Spinner, Button } from 'react-bootstrap';

import { PHButton } from 'src/ui/common/element/muButton';
import { PHFormText } from 'src/ui/common/element/muFormText';
import { ListRow } from '../../common/element/muListRow';
import { Divider } from '../../common/element/divider';

import './main.css';

import { PlaylistListener, PlaylistItem, Playlist } from './playco/model';
import { PlaylistControlModal } from './element/playlistControlModal';
import { PlayCoAPI } from './playco/api';
import { PlayCoSocketIOHandler } from './playco/sio';

const isNumeric = (val) => (/^\d+$/.test(val));

const PlayCoPlaylistList: React.FC = (props: {
  playlistList: Playlist[],
  isPlaylistFetchingState: boolean,
  playlistCreateModalShowState: boolean,
  socketIoConnectionStatusState: string,
  deletePlaylistFunc: (number) => void,
  refreshPlaylistFunc: () => void,
  enterPlaylistFunc: (number) => void,
  setPlaylistCreateModalShowState: (boolean) => void,
}) => {
  const [playlistListState, setPlaylistListState] = useState({
    playlistManualEnterTargetIdTextField: '',
    playlistManualEnterFailedReason: '',
  });
  const navigate = useNavigate();
  const showPlaylistCreateModalFunc = () => props.setPlaylistCreateModalShowState(true);
  const enterPlaylist = (playlistId: number) => {
    if (!playlistId)
      setPlaylistListState({
        ...playlistListState,
        playlistManualEnterFailedReason: '참여하실 재생목록의 ID를 입력해주세요.',
      });

    props.enterPlaylistFunc(playlistId);
  };

  return <aside className='playCoListAside'>
    <div>
      {
        props.socketIoConnectionStatusState && <>
          <PHFormText showOnlyNeeded>{props.socketIoConnectionStatusState}</PHFormText>
          <Divider
            style={{
              marginLeft: 0,
              marginRight: 0,
              marginTop: '1rem',
              marginBottom: '1rem',
              width: '100%',
            }} />
        </>
      }

      <input
        title='ID of playlist to enter'
        placeholder='참여할 재생목록 ID'
        className='playCoIdToEnterTextField'
        disabled={props.isPlaylistFetchingState}
        type='text'
        pattern='\d*'
        value={playlistListState.playlistManualEnterTargetIdTextField}
        onChange={(evt) => {
          const inputedString = evt.target.value.trim();
          if (inputedString && !isNumeric(inputedString))
            return;

          setPlaylistListState({
            ...playlistListState,
            playlistManualEnterTargetIdTextField: inputedString,
            playlistManualEnterFailedReason: '',
          });
        }} ></input>
      <PHButton
        variant='success'
        width='100%'
        disabled={props.isPlaylistFetchingState}
        onClick={() => enterPlaylist(playlistListState.playlistManualEnterTargetIdTextField)} >
        {
          (props.isPlaylistFetchingState)
            ? <>잠시만 기다려주세요...</>
            : <><Icon path={mdiCheckBold} size='1.1rem' />&nbsp;&nbsp;재생목록에 참여하기</>
        }
      </PHButton>
      <PHFormText showOnlyNeeded>{playlistListState.playlistManualEnterFailedReason}</PHFormText>
      <Divider
        style={{
          marginLeft: 0,
          marginRight: 0,
          marginTop: '1rem',
          marginBottom: '1rem',
          width: '100%',
        }} />

      <header>
        <h5 className='playCoPlaylistListTitleContainer'>
          <div className='playCoPlaylistListTitle'>
            내 재생목록
          </div>
          <OverlayTrigger
            placement='bottom'
            overlay={(tooltipProps) => <Tooltip {...tooltipProps} className='playCoPlaylistListRefreshTooltip'>새로고침</Tooltip>} >
            <Button
              className='rounded-circle playCoPlaylistListRefreshButton'
              variant='primary'
              style={{ padding: '0.05rem' }}
              disabled={props.isPlaylistFetchingState}
              onClick={props.refreshPlaylistFunc} >
              <div className='playCoPlaylistDetailListRefreshButtonIconContainer'>
                <Icon path={mdiRefresh} size='1.75rem' />
              </div>
            </Button>
          </OverlayTrigger>
        </h5>
      </header>
      <div className='playCoAsideSectionHeaderButtonContainer'>
        <PHButton
          smaller
          variant='outline-secondary'
          style={{
            color: 'var(--color)',
            border: '1px solid var(--color)',
          }}
          disabled={props.isPlaylistFetchingState}
          onClick={showPlaylistCreateModalFunc} >
          <Icon path={mdiPlus} size='1.1rem' />
          &nbsp;&nbsp;새 재생목록 만들기
        </PHButton>
        <PlaylistControlModal
          createMode
          modalShowState={props.playlistCreateModalShowState}
          setModalShowState={props.setPlaylistCreateModalShowState} />
      </div>
      {
        (props.playlistList && props.playlistList.length != 0)
          ? props.playlistList.map((value, index, array) => <div key={`playco-playlist-main-listitem-${value.uuid}`}>
            <ListRow
              className='playCoListItem'
              style={{
                marginLeft: '1rem',
                marginRight: '1rem',
                border: 'none',
                borderRadius: 'none',
                ...((value.blocked_at) ? {
                  textDecoration: 'line-through red',
                  textDecorationThickness: '0.3rem',
                } : {})
              }}
              itemWidth={[90, 10]}
              onClick={() => enterPlaylist(value.uuid)}>
              <div className='playCoListItemTextContainer'>
                <h6 className='playCoListTitleContainer'>{value.name}</h6>
                <div className='playCoListAdditionalInfoContainer'>
                  <div>{
                    (value.blocked_at)
                      ? value.why_blocked
                      : (value.item_count)
                        ? `${value.item_count}개`
                        : '비어있는 재생목록'
                  }</div>
                  <div>{
                    (value.participant_count)
                      ? `적어도 ${value.participant_count}명이 듣는 중이에요!` : ''
                  }</div>
                </div>
              </div>
              <div>
                <Button
                  variant='link'
                  style={{ color: 'var(--color)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    props.deletePlaylistFunc(value.uuid);
                  }} >
                  <Icon path={mdiDeleteCircle} size='1.75rem' />
                </Button>
              </div>
            </ListRow>
            {(index === (array.length - 1)) ? <></> : <Divider />}
          </div>)
          : (props.isPlaylistFetchingState)
            ? <>재생목록을 불러오는 중이에요,<br />잠시만 기다려주세요...</>
            : <>
              만드신 재생목록이 없어요,<br />
              &quot;새 재생목록 만들기&quot; 버튼을 눌러주세요!
            </>
      }
    </div>
  </aside>;
};

const PlayCoRequireSignedIn: React.FC = () => {
  const navigate = useNavigate();
  return <aside style={{ width: 'calc(var(--width-card) * 1.25)' }}>
    <header>
      <p>
        PlayCo의 특정 기능은 계정이 필요해요,<br />
        이 기능을 위해 로그인을 해 주세요.
      </p>
    </header>
    <PHButton
      onClick={() => navigate('/account/signin')}
      variant='primary'
      size='medium'>
      로그인
    </PHButton>
    <Divider style={{ margin: 'unset', marginLeft: '0', marginRight: '0', marginTop: '1.25rem', marginBottom: '1.25rem', width: '100%' }} />
    {/* <header>
      <p>
        만약 몇몇 기능이 필요없으시다면...
      </p>
    </header>
    <PHButton
      onClick={() => navigate('/')}  // FIXME: NOT READY YET!!!
      variant='outline-info'
      size='medium'>
      로그인 없이 사용하기
    </PHButton> */}
    <header>
      <p>
        현재 로그인 없이 사용할 수 있도록 준비 중이에요,<br />
        조금만 기다려주세요!
      </p>
    </header>
  </aside>;
}

export const PlaycoMain: React.FC = (props) => {
  const accountInfo: AccountInfo = useSelector(state => state.accountReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [playCoMainState, setPlayCoMainState] = useState({
    playlistCreateModalShowState: false,

    playlists: [],
    playlistFetchFailedReason: '',
    didAccountInfoDispatched: false,
    isSignedIn: accountInfo?.isSignedIn ?? false,
    isAccountFetching: accountInfo?.isFetching ?? false,
    isPlaylistFetching: false,
    socketIoConnectionStatus: '',
  });
  const fetchAndUpdatePlaylistListState = () => {
    if (playCoMainState.isPlaylistFetching) // is currently fetching
      return;

    setPlayCoMainState((prevState) => ({
      ...prevState,
      isPlaylistFetching: true,
    }));
    PlayCoAPI.getAllPlaylists().then(
      (result) => setPlayCoMainState((prevState) => ({
        ...prevState,
        isPlaylistFetching: false,
        playlists: result,
        playlistFetchFailedReason: '',
      })),
      (reason: FrostError) => setPlayCoMainState((prevState) => ({
        ...prevState,
        isPlaylistFetching: false,
        playlists: [],
        playlistFetchFailedReason: reason.message,
      })),
    );
  }
  const deletePlaylist = (playlistId) => {
    setPlayCoMainState((prevState) => ({
      ...prevState,
      playlists: [],
      isPlaylistFetching: true,
    }));

    PlayCoAPI.deletePlaylist(playlistId).then(
      (result) => fetchAndUpdatePlaylistListState(),
      (reason: FrostError) => setPlayCoMainState({
        ...playCoMainState,
        playlistFetchFailedReason: reason.message,
      })
    );
  }
  const enterPlaylist = (playlistId) => {
    if (!isNumeric(playlistId))
      return;

    navigate(`/playco/${playlistId}`);
  }

  const setPlaylistCreateModalState = (newState) => {
    setPlayCoMainState((prevState) => ({
      ...prevState,
      playlistCreateModalShowState: newState,
    }));

    if (!newState) {
      // We are closing modal now.
      fetchAndUpdatePlaylistListState();
    }
  }

  useEffect(() => {
    dispatch(refreshAccessTokenActionCreatorAsync());
  }, []);
  useEffect(() => {
    setPlayCoMainState((prevState) => ({
      ...prevState,
      isSignedIn: accountInfo?.isSignedIn ?? false,
      isAccountFetching: accountInfo?.isFetching ?? false,
      didAccountInfoDispatched: true,
    }));
    if (playCoMainState.didAccountInfoDispatched && accountInfo && !accountInfo.isFetching && accountInfo.isSignedIn) {
      fetchAndUpdatePlaylistListState();

      // Initialize SocketIO-client if it's not initialized.
      // const playCoSocketIo = new PlayCoSocketIOHandler();
      // playCoSocketIo.connect();

      return () => {
        // This will be called when this component unmounts.
        // console.log('UNMOUNTED!!!');
      };
    }
  }, [accountInfo]);

  const needToShowSpinner = playCoMainState.isAccountFetching;
  const playCoBody = needToShowSpinner
    ? <Spinner animation='border' role='status'>
      <span className='visually-hidden'>불러오는 중이에요...</span>
    </Spinner>
    : !playCoMainState.isSignedIn
      ? <PlayCoRequireSignedIn />
      : <PlayCoPlaylistList
        playlistList={playCoMainState.playlists}
        isPlaylistFetchingState={playCoMainState.isPlaylistFetching}
        playlistCreateModalShowState={playCoMainState.playlistCreateModalShowState}
        socketIoConnectionStatusState={playCoMainState.socketIoConnectionStatus}
        refreshPlaylistFunc={fetchAndUpdatePlaylistListState}
        deletePlaylistFunc={deletePlaylist}
        enterPlaylistFunc={enterPlaylist}
        setPlaylistCreateModalShowState={setPlaylistCreateModalState} />;

  return <section className='playCoMain'>
    <header>
      <h2>PlayCO<sup className='playCoTitleHeaderSup'>Alpha</sup></h2>
      <p>플레이리스트를, 멀리서, 다 같이</p>
    </header>
    {playCoBody}
  </section>
}
