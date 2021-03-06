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
      newModalState.nameNotUsableReason = '???????????? ????????? ???????????????!';
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
        playlistCreationFailedReason: '???????????? ?????? ????????? ???????????????, ??????????????? ??? ?????????.',
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
          {(props.createMode) ? '???????????? ?????????' : '???????????? ??????'}
        </h5>
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={evt => evt.preventDefault()}>
        <Form.Group>
          <Form.Label>???????????? ??????</Form.Label>
          <Form.Control
            type='text'
            placeholder={
              (props.createMode)
                ? '????????? ?????? ????????? ??????????????? ????????? ???????????????'
                : '????????? ??? ??????????????? ??? ????????? ???????????????'
            }
            disabled={playlistControlModalState.isProcessing}
            value={playlistControlModalState.nameTextFieldValue}
            onChange={handleInputChange('nameTextFieldValue')} />
          <PHFormText>{playlistControlModalState.nameNotUsableReason}</PHFormText>
        </Form.Group>
        <Form.Group>
          <Form.Label>???????????? ??????</Form.Label>
          <Form.Switch
            onChange={handleInputChange('isAllowingDuplicate')}
            checked={playlistControlModalState.isAllowingDuplicate}
            disabled={playlistControlModalState.isProcessing}
            id='isAllowingDuplicateSwitch'
            label={`???????????? ????????? ????????? ??? ${(playlistControlModalState.isAllowingDuplicate) ? '?????????' : '?????????'}.`} />
          <Form.Switch
            onChange={handleInputChange('isPublicAccessable')}
            checked={playlistControlModalState.isPublicAccessable}
            disabled={playlistControlModalState.isProcessing}
            id='isPublicAccessableSwitch'
            label={`?????? ????????? ??????????????? ??? ??? ${(playlistControlModalState.isPublicAccessable) ? '?????????' : '?????????'}.`} />
          <Form.Switch
            onChange={handleInputChange('isPublicItemAppendable')}
            checked={playlistControlModalState.isPublicItemAppendable}
            disabled={playlistControlModalState.isProcessing}
            id='isPublicItemAppendableSwitch'
            label={`?????? ????????? ??????????????? ????????? ????????? ??? ${(playlistControlModalState.isPublicItemAppendable) ? '?????????' : '?????????'}.`} />
          <Form.Switch
            onChange={handleInputChange('isPublicItemDeletable')}
            checked={playlistControlModalState.isPublicItemDeletable}
            disabled={playlistControlModalState.isProcessing}
            id='isPublicItemDeletableSwitch'
            label={`?????? ????????? ?????????????????? ????????? ????????? ??? ${(playlistControlModalState.isPublicItemDeletable) ? '?????????' : '?????????'}.`} />
        </Form.Group>
        <PHFormText>{playlistControlModalState.playlistCreationFailedReason}</PHFormText>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button
        variant='secondary'
        onClick={closeModalFunc}
        disabled={playlistControlModalState.isProcessing}>
        ??????
      </Button>

      <PHSpinnerButton
        variant='primary'
        size={false}
        style={{ margin: undefined }}
        onClick={(props.createMode) ? tryPlaylistCreate : tryPlaylistModify}
        showSpinner={playlistControlModalState.isProcessing}>
        {(props.createMode) ? '???????????? ?????????' : '???????????? ??????'}
      </PHSpinnerButton>
    </Modal.Footer>
  </Modal>;
}
