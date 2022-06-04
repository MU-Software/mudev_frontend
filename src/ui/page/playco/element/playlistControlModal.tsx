import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Modal, Button } from "react-bootstrap";
import { FrostError } from 'src/common/error';

import { PHFormText } from 'src/ui/common/element/muFormText';
import { PHSpinnerButton } from 'src/ui/common/element/muButton';
import { PlaylistConfig } from '../playco/model';
import { PlayCoAPI } from '../playco/api';

export const PlaylistControlModal: React.FC = (props: {
  modalShowState: boolean;
  setModalShowState: (boolean) => void;
  createMode?: boolean;
  initialModalState?: Playlist;
}) => {
  const navigate = useNavigate();
  const [playlistControlModalState, setPlaylistControlModalState] = useState({
    isProcessing: false,

    nameTextFieldValue: props.initialModalState?.name ?? '',
    nameNotUsableReason: '',
    isAllowingDuplicate: props.initialModalState?.allow_duplicate ?? true,
    isPublicAccessable: props.initialModalState?.public_accessable ?? false,
    isPublicItemAppendable: props.initialModalState?.public_item_appendable ?? false,
    isPublicItemDeletable: props.initialModalState?.public_item_deletable ?? false,
    playlistCreationFailedReason: '',
  });
  useEffect(() => setPlaylistControlModalState({
    ...playlistControlModalState,
    nameTextFieldValue: props.initialModalState?.name ?? '',
    nameNotUsableReason: '',
    isAllowingDuplicate: props.initialModalState?.allow_duplicate ?? true,
    isPublicAccessable: props.initialModalState?.public_accessable ?? false,
    isPublicItemAppendable: props.initialModalState?.public_item_appendable ?? false,
    isPublicItemDeletable: props.initialModalState?.public_item_deletable ?? false,
    playlistCreationFailedReason: '',
  }), [props.initialModalState]);
  const currentStateToPlaylistConfig = () => new PlaylistConfig({
    name: playlistControlModalState.nameTextFieldValue,
    allow_duplicate: playlistControlModalState.isAllowingDuplicate,
    public_accessable: playlistControlModalState.isPublicAccessable,
    public_item_appendable: playlistControlModalState.isPublicItemAppendable,
    public_item_deletable: playlistControlModalState.isPublicItemDeletable,
  });
  const closeModalFunc = () => {
    if (!playlistControlModalState.isProcessing)
      props.setModalShowState(false);
  };
  const handleInputChange = (valueName) => (e) => {
    const newModalState = {
      ...playlistControlModalState,
      [valueName]: (e.target.type === 'checkbox') ? e.target.checked : e.target.value,
    };
    if (valueName === 'nameTextFieldValue')
      newModalState.nameNotUsableReason = '';
    setPlaylistControlModalState(newModalState);
  }
  const tryPlaylistCreate = () => {
    let isRequestable = true;

    setPlaylistControlModalState({
      ...playlistControlModalState,
      isProcessing: true,
    });

    const newModalState = {
      ...playlistControlModalState,
      isProcessing: true,
    };
    // trim all strings in states
    for (const key in newModalState)
      if (typeof (newModalState[key]) === 'string')
        newModalState[key] = newModalState[key].trim();

    if (!newModalState.nameTextFieldValue) {
      newModalState.nameNotUsableReason = '재생목록 이름을 적어주세요!';
      newModalState.isProcessing = false;
      isRequestable = false;
    }
    setPlaylistControlModalState(newModalState);

    if (isRequestable) {
      PlayCoAPI
        .createPlaylist(currentStateToPlaylistConfig())
        .then(
          (response) => {
            setPlaylistControlModalState((prevState) => ({
              ...prevState,

              // Reset our modal
              nameTextFieldValue: props.initialModalState?.name ?? '',
              nameNotUsableReason: '',
              isAllowingDuplicate: props.initialModalState?.allow_duplicate ?? true,
              isPublicAccessable: props.initialModalState?.public_accessable ?? false,
              isPublicItemAppendable: props.initialModalState?.public_item_appendable ?? false,
              isPublicItemDeletable: props.initialModalState?.public_item_deletable ?? false,
              playlistCreationFailedReason: '',
              isProcessing: false,
            }));
            closeModalFunc();
          },
          (reason: FrostError) => {
            setPlaylistControlModalState((prevState) => ({
              ...prevState,
              playlistCreationFailedReason: reason.message,
              isProcessing: false,
            }));
          });
    }
  }
  const tryPlaylistModify = () => {
    if (!props.initialModalState?.uuid) {
      setPlaylistControlModalState({
        ...playlistControlModalState,
        playlistCreationFailedReason: '예상하지 못한 오류가 발생했어요, 새로고침을 해 주세요.',
      });
      return;
    }

    setPlaylistControlModalState({
      ...playlistControlModalState,
      isProcessing: true,
    })

    PlayCoAPI
      .modifyPlaylist(
        props.initialModalState.uuid,
        currentStateToPlaylistConfig(),
        props.initialModalState.hash)
      .then(
        (result) => {
          setPlaylistControlModalState((prevState) => ({
            ...prevState,
            isProcessing: false,
          }));
          closeModalFunc();
        },
        (reason: FrostError) => {
          setPlaylistControlModalState((prevState) => ({
            ...prevState,
            isProcessing: false,
            playlistCreationFailedReason: reason.message,
          }));
        },
      );
  }

  return <Modal
    show={props.modalShowState}
    onHide={closeModalFunc}
    backdrop='static'
    centered >
    <Modal.Header closeButton>
      <Modal.Title>
        <h5 style={{ margin: 0, }}>
          {(props.createMode) ? '재생목록 만들기' : '재생목록 수정'}
        </h5>
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={evt => evt.preventDefault()}>
        <Form.Group>
          <Form.Label>재생목록 이름</Form.Label>
          <Form.Control
            type='text'
            placeholder={
              (props.createMode)
                ? '여기에 새로 만드실 재생목록의 이름을 적어주세요'
                : '여기에 이 재생목록의 새 이름을 적어주세요'
            }
            disabled={playlistControlModalState.isProcessing}
            value={playlistControlModalState.nameTextFieldValue}
            onChange={handleInputChange('nameTextFieldValue')} />
          <PHFormText>{playlistControlModalState.nameNotUsableReason}</PHFormText>
        </Form.Group>
        <Form.Group>
          <Form.Label>재생목록 설정</Form.Label>
          <Form.Switch
            onChange={handleInputChange('isAllowingDuplicate')}
            checked={playlistControlModalState.isAllowingDuplicate}
            disabled={playlistControlModalState.isProcessing}
            id='isAllowingDuplicateSwitch'
            label={`중복되는 영상을 추가할 수 ${(playlistControlModalState.isAllowingDuplicate) ? '있어요' : '없어요'}.`} />
          <Form.Switch
            onChange={handleInputChange('isPublicAccessable')}
            checked={playlistControlModalState.isPublicAccessable}
            disabled={playlistControlModalState.isProcessing}
            id='isPublicAccessableSwitch'
            label={`다른 사람이 재생목록을 볼 수 ${(playlistControlModalState.isPublicAccessable) ? '있어요' : '없어요'}.`} />
          <Form.Switch
            onChange={handleInputChange('isPublicItemAppendable')}
            checked={playlistControlModalState.isPublicItemAppendable}
            disabled={playlistControlModalState.isProcessing}
            id='isPublicItemAppendableSwitch'
            label={`다른 사람이 재생목록에 영상을 추가할 수 ${(playlistControlModalState.isPublicItemAppendable) ? '있어요' : '없어요'}.`} />
          <Form.Switch
            onChange={handleInputChange('isPublicItemDeletable')}
            checked={playlistControlModalState.isPublicItemDeletable}
            disabled={playlistControlModalState.isProcessing}
            id='isPublicItemDeletableSwitch'
            label={`다른 사람이 재생목록에서 영상을 삭제할 수 ${(playlistControlModalState.isPublicItemDeletable) ? '있어요' : '없어요'}.`} />
        </Form.Group>
        <PHFormText>{playlistControlModalState.playlistCreationFailedReason}</PHFormText>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button
        variant='secondary'
        onClick={closeModalFunc}
        disabled={playlistControlModalState.isProcessing}>
        취소
      </Button>

      <PHSpinnerButton
        variant='primary'
        size={false}
        style={{ margin: undefined }}
        onClick={(props.createMode) ? tryPlaylistCreate : tryPlaylistModify}
        showSpinner={playlistControlModalState.isProcessing}>
        {(props.createMode) ? '재생목록 만들기' : '재생목록 수정'}
      </PHSpinnerButton>
    </Modal.Footer>
  </Modal>;
}
