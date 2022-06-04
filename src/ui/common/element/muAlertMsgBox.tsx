import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Modal, Button } from "react-bootstrap";
import { FrostError } from 'src/common/error';

import { PHFormText } from 'src/ui/common/element/muFormText';
import { PHSpinnerButton } from 'src/ui/common/element/muButton';
import { PlaylistConfig } from '../playco/model';
import { PlayCoAPI } from '../playco/api';
import './muAlertMsgBox.css';

export const PHAlertMessageBox: React.FC = (props: {
    modalShowState: boolean;
    setModalShowState: (boolean) => void;
    onAcceptBtnClick: () => void;
    onCancelBtnClick?: () => void;
    title: string;
    body: React.FC;
    showCloseBtn?: boolean;
    variant?: 'warning' | 'error';
}) => {
    const closeModalFunc = () => props.setModalShowState(false);

    let msgBoxBody = props.body;
    if ((typeof (props.body) === 'string' || props.body instanceof String) && props.body.includes('\n'))
        msgBoxBody = <div>{props.body.split('\n').map((value) => <>{value}<br /></>)}</div>;

    return <Modal
        className={`muAlertMsgBoxModal${props.variant ?? ''}`}
        show={props.modalShowState}
        onHide={closeModalFunc}
        backdrop='static'
        keyboard={false}
        centered >
        <Modal.Header closeButton={props.showCloseBtn}>
            <Modal.Title><h5 style={{ margin: 0, }}>{props.title}</h5></Modal.Title>
        </Modal.Header>
        <Modal.Body>{msgBoxBody}</Modal.Body>
        <Modal.Footer>
            {props.onCancelBtnClick && <Button variant='secondary' onClick={props.onCancelBtnClick}>취소</Button>}
            <Button
                variant={(props.variant === 'error') ? 'danger' : (props.variant === 'warning') ? 'warning' : 'primary'}
                onClick={props.onAcceptBtnClick}>확인</Button>
        </Modal.Footer>
    </Modal>;
}
