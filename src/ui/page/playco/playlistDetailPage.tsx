import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import Icon from '@mdi/react';
import { mdiPlus, mdiTools, mdiAccountCircle, mdiRefresh, mdiPlayCircle, mdiDelete } from '@mdi/js';

import { ListRow } from '../../common/element/muListRow';
import { Divider } from '../../common/element/divider';
import { PHButton } from '../../common/element/muButton';
import { PHFormText } from 'src/ui/common/element/muFormText';
import { PHAlertMessageBox } from 'src/ui/common/element/muAlertMsgBox';
import { YoutubeThumbnail } from '../../common/element/util/youtubeThumbnail';

import { FrostError } from 'src/common/error';
import { PlaylistControlModal } from './element/playlistControlModal';
import {
  PlaylistListener,
  PlaylistItem,
  Playlist,
  // PlaylistConfig
} from './playco/model';
import './playlistDetailPage.css';
import { PlayCoAPI } from './playco/api';
import { PlayCoSocketIOHandler, PlayCoRoomType } from './playco/sio';

type PlaylistItemParticipantStateType = Array<{
  nickname: string;
  data?: Record<string, unknown>;
}>;

type PlaylistParticipantStateType = Map<number, PlaylistItemParticipantStateType>;

type PlayCoPlaylistDetailStateType = {
  playlistData: Playlist;
  participantStatus: PlaylistParticipantStateType;
  showPlaylistModifyModal: boolean;
  showAlertMessageBoxModal: boolean;
  alertMessageBoxModalData: { title: string; body: string; onAcceptBtnClick: () => void; };

  autoplay: boolean;
  loopMode: number;
  currentPlayingIndex: number;
  currentPlayingUrl: string;

  isAccountFetching: boolean;
  isPlaylistFetching: boolean;

  socketIoConnectionStatus: string;
};

const isNumeric = (val) => (/^\d+$/.test(val));

export const PlaylistDetailDummyListener: React.FC = () => <div style={{ height: '16pt' }} />;
export const PlaylistDetailListener: React.FC = (props: { nick: string; imgUrl?: string; }) => {
  return <OverlayTrigger
    placement='bottom'
    overlay={(tooltipProps) => <Tooltip {...tooltipProps}>{props.nick}</Tooltip>} >
    <Icon path={mdiAccountCircle} size='16pt' />
  </OverlayTrigger>;
};

export const PlaylistDetailItem: React.FC = (props: {
  playlistItemData: PlaylistItem;
  playlistItemParticipantStatusData?: PlaylistItemParticipantStateType;
  onClickFunc: () => void;
  onDeleteBtnClickFunc: () => void;
  selected?: boolean;
}) => {
  const isSelected = props.selected ?? false;
  return <ListRow
    onClick={(isSelected) ? null : props.onClickFunc}
    className='playCoPlaylistDetailListItem'
    itemWidth={[25, 70, 5]}
    style={{
      // This cannot be moved to css,
      // as we have to overwrite the element style of ListRow.
      alignItems: 'center',
      marginLeft: '0',
      marginRight: '0',
      borderRadius: '0.3rem',
      ...(isSelected ? {
        border: 'none',
        outline: '1px solid rgba(255, 255, 255, 1)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      } : {
        border: 'none',
        outline: 'none',
      })
    }}>
    <div className='playCoPlaylistDetailListItemThumbnailContainer'>
      <YoutubeThumbnail youtubeId={props.playlistItemData.link_id} />
    </div>
    <div className='playCoPlaylistDetailListItemInfoContainer'>
      <div className='playCoPlaylistDetailListItemTitle'>{props.playlistItemData.name}</div>
      <div className='playCoPlaylistDetailListItemListenerListContainer'>
        <div className='playCoPlaylistDetailListItemListenerList'>
          {(props.playlistItemParticipantStatusData?.length) ? (props.playlistItemParticipantStatusData.map((value, index) => {
            return <PlaylistDetailListener
              key={`playco-playlist-detail-listitem-listener-${index}`}
              nick={value.nickname}
              imgUrl={value.data?.img_url} />
          })) : <PlaylistDetailDummyListener
            key={`playco-playlist-detail-listitem-listener-0`} />}
        </div>
      </div>
    </div>
    <div>
      <Button
        variant='link'
        style={{ color: 'var(--color)' }}
        onClick={(e) => { e.stopPropagation(); props.onDeleteBtnClickFunc(); }} >
        <Icon path={mdiDelete} size='1.75rem' />
      </Button>
    </div>
  </ListRow>;
};
export const PlaylistDetail: React.FC = (props: {
  setPlaylistModifyModalShowStateFunc: (boolean) => void;
  setPlaylistCurrentPlayingStateFunc: (number) => void;
  deletePlaylistItemFunc: (number) => void;
  refreshPlaylistDataFunc: () => void;
  addPlaylistItemFunc?: (string) => Promise<{ newItemUrlTextFieldValue: string, newItemUrlNotUsableReason: string }>;
  playlistData: Playlist;
  participantStatus?: PlaylistParticipantStateType;
  isSignedIn?: boolean;
  disabled?: boolean;
  currentPlayingIndex: number;
  socketIoConnectionStatusState: string;
}) => {
  const [playlistDetailState, setPlaylistDetailState] = useState({
    newItemUrlTextFieldValue: '',
    newItemUrlNotUsableReason: '',
  });
  const onAddPlaylistItemBtnClick = () => {
    props.addPlaylistItemFunc(playlistDetailState.newItemUrlTextFieldValue)
      .then((result) => setPlaylistDetailState({
        ...playlistDetailState,
        ...(result ?? {})
      }));
  }
  return <aside className='playCoPlaylistDetailList'>
    <header>
      <h5 className='playCoPlaylistDetailListTitleContainer'>
        <div className='playCoPlaylistDetailListTitle'>
          {props.playlistData.name}
        </div>
        <OverlayTrigger
          placement='bottom'
          overlay={(tooltipProps) => <Tooltip {...tooltipProps} className='playCoPlaylistDetailListRefreshTooltip'>재생목록 새로고침</Tooltip>} >
          <Button
            className='rounded-circle playCoPlaylistDetailListRefreshButton'
            variant='primary'
            style={{ padding: '0.05rem' }}
            disabled={props.disabled}
            onClick={props.refreshPlaylistDataFunc}>

            <div className='playCoPlaylistDetailListRefreshButtonIconContainer'>
              <Icon path={mdiRefresh} size='1.75rem' />
            </div>
          </Button>
        </OverlayTrigger>
      </h5>
    </header>
    <Divider style={{ margin: 'unset', marginLeft: '0', marginRight: '0', marginTop: '1.25rem', marginBottom: '1.25rem', width: '100%' }} />
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
      title='Add item on playlist'
      placeholder='재생목록에 추가할 URL'
      className='playCoPlaylistDetailAddTextField'
      disabled={props.disabled}
      value={playlistDetailState.newItemUrlTextFieldValue}
      onChange={(evt) => setPlaylistDetailState({
        ...playlistDetailState,
        newItemUrlTextFieldValue: evt.target.value,
        newItemUrlNotUsableReason: '',
      })}
    ></input>
    <PHFormText showOnlyNeeded>{playlistDetailState.newItemUrlNotUsableReason}</PHFormText>
    <div className='playCoPlaylistDetailBtnGroup'>
      <PHButton
        smaller
        variant='warning'
        disabled={props.disabled}
        onClick={() => props.setPlaylistModifyModalShowStateFunc(true)}>
        <Icon path={mdiTools} size='1.1rem' />&nbsp;&nbsp;재생목록 설정
      </PHButton>
      <PHButton
        smaller
        variant='primary'
        disabled={props.disabled}
        onClick={onAddPlaylistItemBtnClick} >
        <Icon path={mdiPlus} size='1.1rem' />&nbsp;&nbsp;재생목록에 추가하기
      </PHButton>
    </div>
    <Divider style={{ margin: 'unset', marginLeft: '0', marginRight: '0', marginTop: '1.25rem', marginBottom: '1.25rem', width: '100%' }} />
    <div>
      {(props.playlistData.items.length)
        ? props.playlistData.items.map((value, index) => <PlaylistDetailItem
          key={`playco-playlist-detail-listitem-${value.uuid}`}
          onClickFunc={props.disabled
            ? () => { /* */ }
            : () => props.setPlaylistCurrentPlayingStateFunc(index)}
          onDeleteBtnClickFunc={props.disabled
            ? () => { /* */ }
            : () => props.deletePlaylistItemFunc(index)}
          playlistItemData={value}
          playlistItemParticipantStatusData={props.participantStatus?.get(index)}
          selected={index === props.currentPlayingIndex} />)
        : <ListRow style={{ width: '100%', marginRight: '0', marginLeft: '0', border: 'none' }}>재생목록에 아무 것도 없어요...</ListRow>}
    </div>
  </aside>;
};

export const PlaylistDetailPlayer: React.FC = (props: {
  targetUrl: string;
  autoplay: boolean;
  loopMode: number;
  setAutoplayStateFunc: (boolean) => void;
  setLoopModeStateFunc: () => void;
  onPlayerEndedFunc?: () => void;
}) => {
  const playerConfig = {
    youtube: {
      playerVars: {
        autoplay: props.autoplay ? 1 : 0,
        loop: props.loopMode === 1 ? 1 : 0,
        showinfo: 1,
        controls: 1,
      }
    }
  };

  return <aside className='playCoPlaylistDetailPlayerAside'>
    <div className='playCoPlaylistDetailPlayerContainer'>
      <ReactPlayer
        controls pip
        className='playCoPlaylistDetailPlayer'
        width='100%' height='100%'
        config={playerConfig}

        url={props.targetUrl}
        loop={props.loopMode === 1}
        playing={props.autoplay}
        onEnded={(props.loopMode) ? props.onPlayerEndedFunc : null} />
    </div>
    <br />
    <div className='playCoPlaylistDetailPlayerBtnGroup'>
      <PHButton
        variant={(props.autoplay) ? 'primary' : 'outline-primary'}
        onClick={() => props.setAutoplayStateFunc(!props.autoplay)} >
        <Icon path={mdiPlayCircle} size='1.1rem' />&nbsp;&nbsp;자동 재생
      </PHButton>

      <PHButton
        variant={(props.loopMode === 0) ? 'outline-primary' : 'primary'}
        onClick={props.setLoopModeStateFunc} >
        <Icon path={mdiRefresh} size='1.1rem' />
        &nbsp;&nbsp;{
          (props.loopMode === 0)
            ? '반복  해제됨' // loopMode === 0
            : (props.loopMode === 1)
              ? '한곡 반복 중' // loopMode === 1
              : (props.loopMode === 2)
                ? '전곡 반복 중' // loopMode === 2
                : '전곡 한번만 재생 중' // loopMode === 3
        }
      </PHButton>
    </div>
  </aside>;
};

export const PlayCoPlaylistDetail: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [playlistDetailRootState, setPlaylistDetailRootState] = useState<PlayCoPlaylistDetailStateType>({
    playlistData: new Playlist({
      uuid: -1,
      index: 0,
      name: '정보를 불러오는 중...',

      public_accessable: false,
      public_modifiable: false,
      public_item_appendable: false,
      public_item_orderable: false,
      public_item_deletable: false,
      allow_duplicate: false,

      items: [
        new PlaylistItem({
          uuid: -1,
          index: 0,
          name: '정보를 불러오는 중이에요, 잠시만 기다려주세요...',
          data: {},

          added_by_uuid: -1,
          added_by_nick: '',

          link: '',
          link_type: '',
          link_id: '',
          current_listener: [],
        }),
      ],
    }),
    participantStatus: new Map(),
    showPlaylistModifyModal: false,
    showAlertMessageBoxModal: false,
    alertMessageBoxModalData: { title: '', body: '', onAcceptBtnClick: () => { /* */ }, },

    autoplay: true,
    // 0: loop disabled
    // 1: loop one item
    // 2: loop all items in playlist, and loop again if the last item in playlist played.
    // 3: loop all items in playlist, and stop if the last item in playlist played.
    loopMode: 3,
    currentPlayingIndex: 0,
    currentPlayingUrl: '',

    isFirstInitialized: false,
    isAccountFetching: false,
    isPlaylistFetching: false,

    socketIoConnectionStatus: '',
  });
  const defaultAlertMsgModalData = {
    title: '재생목록을 불러올 수 없어요...',
    body: '',
    onAcceptBtnClick: () => navigate('/playco'),
  }
  const playCoSocketIO = new PlayCoSocketIOHandler();

  const refreshPlaylistData = () => {
    if (playlistDetailRootState.isAccountFetching || playlistDetailRootState.isPlaylistFetching)
      return;

    setPlaylistDetailRootState((prevState) => ({ ...prevState, isPlaylistFetching: true, }));

    // Fetch playlist from API
    PlayCoAPI
      .getPlaylistInfo(params.playlistId)
      .then(
        (result) => setPlaylistDetailRootState((prevState) => ({
          ...prevState,
          isFirstInitialized: true,
          isPlaylistFetching: false,
          playlistData: result,

          // Update playlist state if this is the first time the playlist information is loading
          // or there's a new item added on a playlist when the playlist was empty
          ...((prevState.playlistData.uuid === -1 || prevState.playlistData.items.length === 0) ? {
            currentPlayingUrl: result.items[0]?.link ?? '',
            currentPlayingIndex: 0,
          } : {}),
        })),
        (reason: FrostError) => setPlaylistDetailRootState((prevState) => ({
          ...prevState,
          isPlaylistFetching: false,
          showAlertMessageBoxModal: true,
          alertMessageBoxModalData: {
            ...defaultAlertMsgModalData,
            body: reason.message,
          },
        }))
      )
  }
  const setPlaylistLoopModeState = () => {
    setPlaylistDetailRootState({
      ...playlistDetailRootState,
      loopMode: (playlistDetailRootState.loopMode <= 0) ? 3 : playlistDetailRootState.loopMode - 1,
    });
  }
  const setPlaylistModifyModalShowState = (newState: boolean) => {
    if (!playlistDetailRootState.playlistData
      || playlistDetailRootState.playlistData.uuid <= 0
      || playlistDetailRootState.isAccountFetching
      || playlistDetailRootState.isPlaylistFetching)
      return;

    setPlaylistDetailRootState({
      ...playlistDetailRootState,
      showPlaylistModifyModal: newState,
    });

    // Re-fetch playlist data when config modal closed.
    if (!newState) refreshPlaylistData();
  };
  const setPlaylistCurrentPlayingState = (newIndex: number) => {
    if (0 > newIndex || newIndex > playlistDetailRootState.playlistData.items.length - 1)
      return;

    const newPlayerLink = (playlistDetailRootState.playlistData.items != 0) ? playlistDetailRootState.playlistData.items[newIndex].link : '';
    setPlaylistDetailRootState({
      ...playlistDetailRootState,
      currentPlayingIndex: newIndex,
      currentPlayingUrl: newPlayerLink,
    });
    if (playlistDetailRootState.isFirstInitialized && playCoSocketIO.connected) {
      playCoSocketIO.setSessionCurrentPlaying(playlistDetailRootState.playlistData.uuid, newIndex);
    }
  }
  const setPlaylistCurrentPlayingStateToNext = () => {
    if (playlistDetailRootState.currentPlayingIndex + 1 >= playlistDetailRootState.playlistData.items.length) {
      if (playlistDetailRootState.loopMode === 2)
        setPlaylistCurrentPlayingState(0);
      return;
    }
    setPlaylistCurrentPlayingState(playlistDetailRootState.currentPlayingIndex + 1);
  }

  const addPlaylistItem = (newItemUrl: string) => {
    if (!playlistDetailRootState.playlistData
      || playlistDetailRootState.playlistData.uuid <= 0
      || playlistDetailRootState.isAccountFetching
      || playlistDetailRootState.isPlaylistFetching)
      return;

    newItemUrl = (newItemUrl ?? '').trim();
    if (!newItemUrl)
      return new Promise((resolve) => resolve({
        newItemUrlTextFieldValue: newItemUrl,
        newItemUrlNotUsableReason: '재생목록에 추가할 URL을 적어주세요!',
      }));

    setPlaylistDetailRootState((prevState) => ({ ...prevState, isPlaylistFetching: true, }));

    return PlayCoAPI.insertPlaylistItem(
      playlistDetailRootState.playlistData.uuid,
      newItemUrl,
      playlistDetailRootState.playlistData.hash)
      .then(
        (result) => {
          setPlaylistDetailRootState((prevState) => ({ ...prevState, isPlaylistFetching: false, }));
          if (!result.success) {
            let errorMsg: string | null = null;
            let shouldUrlTextFieldCleared = false;

            if (result.subCode === 'resource.forbidden') {
              errorMsg = '재생목록에 추가할 수 있는 권한이 없어요.';
            } else if (result.subCode === 'resource.prediction_failed') {
              if (result.data.prediction_failed_reason?.includes('playlist_outdated')) {
                errorMsg = '재생목록에 수정사항이 생겼어요,\n상단의 "새로고침" 버튼을 눌러주세요.';
              } else if (result.data.prediction_failed_reason?.includes('link_not_implemented')) {
                shouldUrlTextFieldCleared = true;
                errorMsg = '지금은 YouTube 영상만 지원해요,\n다른 영상의 URL을 시도해주세요.';
              } else if (result.data.prediction_failed_reason?.includes('link_data_fetch_failed')) {
                errorMsg = '영상의 정보를 확인할 수 없어요,\n다른 URL을 시도하시거나 10분 후 다시 시도해주세요.';
              } else {
                errorMsg = '알 수 없는 문제가 생겼어요,\n상단의 "새로고침" 버튼을 눌러주세요.';
              }
            } else if (result.subCode === 'resource.unique_failed') {
              errorMsg = '이미 재생목록에 해당 영상이 포함되어 있어요,\n'
              errorMsg += '만약 재생목록에 중복해서 포함하고 싶으시다면\n';
              errorMsg += '"재생목록 설정"에서 설정을 바꿔주세요.';
            } else if (result.subCode === 'resource.not_found') {
              // Show an alertbox and kick to main screen
              setPlaylistDetailRootState((prevState) => ({
                ...prevState,
                isPlaylistFetching: false,
                showAlertMessageBoxModal: true,
                alertMessageBoxModalData: {
                  ...defaultAlertMsgModalData,
                  body: (<>존재하지 않는 재생목록 ID입니다,<br />ID를 확인 후 다시 시도해주세요.</>),
                },
              }));
            } else {
              errorMsg = '알 수 없는 문제가 생겼어요,\n상단의 "새로고침" 버튼을 눌러주세요.';
            }

            // Don't erase url input field, so that user can try once more.
            return {
              ...(shouldUrlTextFieldCleared ? { newItemUrlTextFieldValue: '', } : {}),
              newItemUrlNotUsableReason: errorMsg,
            };
          }

          refreshPlaylistData();
          return {
            newItemUrlTextFieldValue: '',
            newItemUrlNotUsableReason: '',
          };
        },
        (reason: FrostError) => {
          setPlaylistDetailRootState((prevState) => ({ ...prevState, isPlaylistFetching: false, }));
          return { newItemUrlNotUsableReason: reason.message, };
        });
  };
  const deletePlaylistItem = (index: number) => {
    if (!playlistDetailRootState.playlistData
      || playlistDetailRootState.playlistData.uuid <= 0
      || playlistDetailRootState.isAccountFetching
      || playlistDetailRootState.isPlaylistFetching)
      return;

    setPlaylistDetailRootState((prevState) => ({ ...prevState, isPlaylistFetching: true, }));

    PlayCoAPI.deletePlaylistItem(
      playlistDetailRootState.playlistData.uuid,
      index,
      playlistDetailRootState.playlistData.hash)
      .then(
        (result) => {
          if (playlistDetailRootState.currentPlayingIndex >= index) {
            // Fetch playlist items after deleting item,
            // and set playlist data while doing minus 1 on currentPlayingIndex not to change currentPlayingUrl,
            // as "one item before current playing item" or "current playing item" is gone, and we don't want to refresh player.
            setPlaylistDetailRootState((prevState) => ({
              ...prevState,
              currentPlayingIndex: prevState.currentPlayingIndex - 1,
            }));
          } else {
            // Update playlist data state after deleting item and ignore it.
            // Deleting item after current playing item won't affect our player.
          }
          refreshPlaylistData();
        },
        (reason: FrostError) => {
          setPlaylistDetailRootState((prevState) => ({
            ...prevState,
            newItemUrlNotUsableReason: reason.message,
            isPlaylistFetching: false,
          }));
        }
      );
  }

  // Socket.IO specific event handler
  const onPlaylistUserStateModified = (newRoomState: PlayCoRoomType) => {
    // Convert PlayCoRoomType to PlaylistParticipantStateType
    const newParticipantState: PlaylistParticipantStateType = new Map();

    if (playlistDetailRootState.playlistData.uuid != newRoomState.playlist_id)
      return;

    for (const [nickname, roomStatus] of Object.entries(newRoomState.participants)) {
      const currentStateIndex = roomStatus.status.currently_playing;
      if (!newParticipantState.has(currentStateIndex)) {
        newParticipantState.set(currentStateIndex, []);
      }
      newParticipantState.get(currentStateIndex)?.push({ nickname: nickname, data: roomStatus.data, });
    }

    setPlaylistDetailRootState((prevState) => ({ ...prevState, participantStatus: newParticipantState, }))
  };
  const onSocketIOStatusChanged = (newSIOStateMessage: string) => {
    setPlaylistDetailRootState((prevState) => ({ ...prevState, socketIoConnectionStatus: newSIOStateMessage, }));
  };

  playCoSocketIO.onPlayCoConnected = () => {
    // Try to connect SocketIO and fetch participant status.
    playCoSocketIO.enterPlaylist(
      playlistDetailRootState.playlistData.uuid,
      playlistDetailRootState.currentPlayingIndex);
  };
  playCoSocketIO.onSocketIOStatusChanged = onSocketIOStatusChanged;
  playCoSocketIO.onPlaylistModified = refreshPlaylistData;
  playCoSocketIO.onUserStatusChanged = onPlaylistUserStateModified;

  useEffect(() => {
    // Check if params.playlistId is a valid numeric value
    if (!isNumeric(params.playlistId)) {
      setPlaylistDetailRootState({
        ...playlistDetailRootState,
        showAlertMessageBoxModal: true,
        alertMessageBoxModalData: {
          ...defaultAlertMsgModalData,
          body: (<>올바르지 않은 재생목록 ID입니다,<br />ID를 확인 후 다시 시도해주세요.</>),
        },
      });
      return;
    }

    // Initialize and fetch playlist data
    if ((!playlistDetailRootState.playlistData || playlistDetailRootState.playlistData.uuid <= 0)
      && !playlistDetailRootState.isAccountFetching && !playlistDetailRootState.isPlaylistFetching)
      refreshPlaylistData();

    return () => { // Page unmounted
      // Try to leave SocketIO room.
      // playCoSocketIO.leavePlaylist(playlistDetailRootState.playlistData.uuid);
      playCoSocketIO.disconnect(true);
    }
  }, []);

  useEffect(() => {
    if (playlistDetailRootState.isFirstInitialized) {
      playCoSocketIO.connect();
    }
  }, [playlistDetailRootState.isFirstInitialized])

  return <section className='playCoPlaylistDetailPage'>
    <PHAlertMessageBox
      variant='error'
      modalShowState={playlistDetailRootState.showAlertMessageBoxModal}
      setModalShowState={(newState: boolean) => setPlaylistDetailRootState({ ...playlistDetailRootState, showAlertMessageBoxModal: newState })}
      {...(playlistDetailRootState.alertMessageBoxModalData ?? {})} />
    <header>
      <h2>PlayCO<sup className='playCoTitleHeaderSup'>Alpha</sup></h2>
      <p>플레이리스트를, 멀리서, 다 같이</p>
    </header>
    <div className='playCoPlaylistDetail'>
      <PlaylistControlModal
        initialModalState={playlistDetailRootState.playlistData}
        modalShowState={playlistDetailRootState.showPlaylistModifyModal}
        setModalShowState={setPlaylistModifyModalShowState} />
      <PlaylistDetail
        playlistData={playlistDetailRootState.playlistData}
        participantStatus={playlistDetailRootState.participantStatus}
        currentPlayingIndex={playlistDetailRootState.currentPlayingIndex}
        socketIoConnectionStatusState={playlistDetailRootState.socketIoConnectionStatus}
        disabled={
          !playlistDetailRootState.playlistData
          || playlistDetailRootState.playlistData.uuid <= 0
          || playlistDetailRootState.isAccountFetching
          || playlistDetailRootState.isPlaylistFetching
        }
        setPlaylistModifyModalShowStateFunc={setPlaylistModifyModalShowState}
        setPlaylistCurrentPlayingStateFunc={setPlaylistCurrentPlayingState}
        addPlaylistItemFunc={addPlaylistItem}
        deletePlaylistItemFunc={deletePlaylistItem}
        refreshPlaylistDataFunc={refreshPlaylistData} />
      <PlaylistDetailPlayer
        targetUrl={playlistDetailRootState.currentPlayingUrl}
        loopMode={playlistDetailRootState.loopMode}
        setLoopModeStateFunc={setPlaylistLoopModeState}
        autoplay={playlistDetailRootState.autoplay}
        setAutoplayStateFunc={(newState) => setPlaylistDetailRootState({ ...playlistDetailRootState, autoplay: newState })}
        onPlayerEndedFunc={setPlaylistCurrentPlayingStateToNext} />
    </div>
  </section>;
};
