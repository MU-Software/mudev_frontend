import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { refreshAccessTokenActionCreatorAsync } from 'src/redux/modules/account/action_creator';
import { isEmail } from 'validator';

import { Form, Modal, Button } from "react-bootstrap";
import { FrostError } from 'src/common/error';

import { PHFormText } from 'src/ui/common/element/muFormText';
import { PHSpinnerButton } from 'src/ui/common/element/muButton';
import { AccountInfo } from 'src/redux/modules/account/model';
import FrostAPI from 'src/network/api';

interface AccountNickIDChangeModalStateType {
    isProcessing: boolean;

    nickTextFieldValue: string;
    nickNotUsableReason: string;
    idTextFieldValue: string;
    idNotUsableReason: string;
    nickIdChangeFailedReason: string;
}

const calculateIncludedCharType = (str: string) => {
    const strType: string[] = [];

    for (let i = 0; i < str.length; i++) {
        const currentChar = str.charAt(i);
        if (currentChar >= '0' && currentChar <= '9') {
            strType.push('n'); // number
        } else if (currentChar >= 'a' && currentChar <= 'z') {
            strType.push('l'); // lower
        } else if (currentChar >= 'A' && currentChar <= 'Z') {
            strType.push('u'); // upper
        } else if (currentChar >= ' ' && currentChar <= '~') {
            strType.push('s'); // special char
        } else {
            strType.push('e'); // error or unknown
        }
    }
    return new Set(strType);
};

export const AccountNickIDChangeModal: React.FC = (props: {
    modalShowState: boolean;
    setModalShowState: (boolean) => void;
}) => {
    const InputChecker = {
        id: (str: string) => {
            if (!str) {
                return {
                    success: false,
                    idNotUsableReason: '새 아이디를 입력해주세요.',
                };
            } else if (str.length < 4) {
                return {
                    success: false,
                    idNotUsableReason: '새 아이디의 길이가 너무 짧아요, 4자 이상으로 적어주세요.',
                };
            } else if (48 < str.length) {
                return {
                    success: false,
                    idNotUsableReason: '새 아이디의 길이가 너무 길어요, 48자 이하로 적어주세요.',
                };
            }

            const strType = calculateIncludedCharType(str);
            if (strType.has('e') || strType.has('s')) {
                return {
                    success: false,
                    idNotUsableReason: '새 아이디에 사용할 수 없는 글자가 포함되어 있어요,\n공백, 특수문자 등을 빼고 다시 입력해주세요.',
                };
            }

            return { success: true, idNotUsableReason: null };
        },
        nick: (str: string) => {
            if (!str) {
                return {
                    success: false,
                    nickNotUsableReason: '별칭을 입력해주세요.',
                };
            }

            return {
                success: true,
                nickNotUsableReason: null,
            };
        },
    };
    const FrostErrorToAccountNickIdChangeError = (err: FrostError) => {
        if (!err)
            return { nickIdChangeFailedReason: null };
        if (err.route !== 'account')
            return { nickIdChangeFailedReason: null };
        // We need to set Frost's error message(showMsg)
        // to proper (id|nick)NotUsableReason field or nickIdChangeFailedReason.
        const errShowMsg = err.message;
        const errFieldName = (err.fieldName) ? `${err.fieldName}NotUsableReason` : 'nickIdChangeFailedReason';

        return { [errFieldName]: errShowMsg, };
    };

    const accountInfo: AccountInfo = useSelector(state => state.accountReducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [nickIdChangeModalState, setNickIdChangeModalState] = useState({
        isProcessing: false,

        nickTextFieldValue: accountInfo.nick ?? '',
        nickNotUsableReason: '',
        idTextFieldValue: accountInfo.id ?? '',
        idNotUsableReason: '',
        nickIdChangeFailedReason: '',
    });
    // Reset form inputs when accountInfo changed or modal showed/disappeared.
    useEffect(() => setNickIdChangeModalState({
        ...nickIdChangeModalState,
        nickTextFieldValue: accountInfo.nick ?? '',
        nickNotUsableReason: '',
        idTextFieldValue: accountInfo.id ?? '',
        idNotUsableReason: '',
        nickIdChangeFailedReason: '',
    }), [accountInfo, props.modalShowState]);

    const closeModalFunc = () => {
        if (!nickIdChangeModalState.isProcessing)
            props.setModalShowState(false);
    };

    const getTrimmedState = (modalState?: AccountNickIDChangeModalStateType) => {
        const tempModalState: AccountNickIDChangeModalStateType = { ...(modalState ?? nickIdChangeModalState), };
        for (const key in tempModalState)
            if (typeof (tempModalState[key]) === 'string')
                tempModalState[key] = tempModalState[key].trim();

        return tempModalState;
    };
    const handleInputChange = (fieldName: string) => (e: Event) => {
        const fieldStateKey = `${fieldName}TextFieldValue`;
        const fieldValue = (e.target.type === 'checkbox') ? e.target.checked : e.target.value;

        const checkerResult = InputChecker[fieldName](fieldValue.trim());
        delete (checkerResult.success);

        setNickIdChangeModalState((prevState) => ({
            ...prevState,
            ...checkerResult,
            [fieldStateKey]: fieldValue,
        }));
    };

    const whatChanged = () => {
        // Trim and test
        const tempModalState = getTrimmedState();
        return {
            nick: tempModalState.nickTextFieldValue !== accountInfo.nick,
            id: tempModalState.idTextFieldValue !== accountInfo.id
        };
    };
    const getSubmitBtnText = () => {
        const result = whatChanged();
        if (result.id && result.nick) {
            return '아이디 및 별칭 수정하기';
        } else if (result.id) {
            return '아이디 수정하기';
        } else if (result.nick) {
            return '별칭 수정하기';
        } else {
            return '수정된 정보가 없어요';
        }
    };
    const shouldSubmitBtnDisabled = () => {
        if (nickIdChangeModalState.isProcessing)
            return true;

        const isChanged = whatChanged();
        if (!isChanged.id && !isChanged.nick)
            return true;

        const tempModalState = getTrimmedState();
        let isFormCheckSuccess = true;
        ['id', 'nick'].map(fieldName => {
            const fieldValue: string = tempModalState[`${fieldName}TextFieldValue`];
            const fieldCheckResult: string = InputChecker[fieldName](fieldValue);

            if (isFormCheckSuccess)
                // It's OK to set true to false, but false to true must not be happened.
                // And also, we are in a map function, so we cannot return directly here,
                // we need to store the result somewhere outside of the function.
                isFormCheckSuccess = fieldCheckResult.success;
        });

        return !isFormCheckSuccess;
    };

    const resetToOriginal = () => {
        setNickIdChangeModalState({
            ...nickIdChangeModalState,
            nickTextFieldValue: accountInfo.nick ?? '',
            nickNotUsableReason: '',
            idTextFieldValue: accountInfo.id ?? '',
            idNotUsableReason: '',
        });
    };
    const tryAccountInfoChange = () => {
        // Trim all strings in states
        const tempModalState = getTrimmedState();
        setNickIdChangeModalState(prevState => ({
            ...prevState,
            ...tempModalState,
            isProcessing: true,
        }));

        const isChanged = whatChanged();
        if (!isChanged.id && !isChanged.nick) {
            // Stats are not modified, just close it.
            setNickIdChangeModalState(prevState => ({
                ...prevState,
                isProcessing: false,
            }));
            return;
        }

        let isFormCheckSuccess = true;
        let resultFormCheckData = {};
        ['id', 'nick'].map(fieldName => {
            const fieldValue = tempModalState[`${fieldName}TextFieldValue`];
            const fieldCheckResult = InputChecker[fieldName](fieldValue);

            if (isFormCheckSuccess)
                // It's OK to set true to false, but false to true must not be happened.
                // And also, we are in a map function, so we cannot return directly here,
                // we need to store the result somewhere outside of the function.
                isFormCheckSuccess = fieldCheckResult.success;

            resultFormCheckData = { ...resultFormCheckData, ...fieldCheckResult };
        });
        delete (resultFormCheckData.success);

        setNickIdChangeModalState(prevState => ({
            ...prevState,
            ...resultFormCheckData,
            isProcessing: isFormCheckSuccess,
        }));

        if (!isFormCheckSuccess)
            return;

        (new FrostAPI())
            .modifyAccountInfo({
                ...((isChanged.id) ? { id: tempModalState.idTextFieldValue, } : {}),
                ...((isChanged.nick) ? { nickname: tempModalState.nickTextFieldValue, } : {}),
            })
            .then(() => {
                setNickIdChangeModalState(prevState => ({ ...prevState, isProcessing: false, }));
                dispatch(refreshAccessTokenActionCreatorAsync(true));
                closeModalFunc();
            })
            .catch((reason: FrostError) => {
                console.log(reason);
                console.log(reason.debugMessage);
                setNickIdChangeModalState(prevState => ({
                    ...prevState,
                    isProcessing: false,
                    ...FrostErrorToAccountNickIdChangeError(reason),
                }));
            });

    };

    return <Modal
        show={props.modalShowState}
        onHide={closeModalFunc}
        backdrop='static'
        centered >
        <Modal.Header closeButton>
            <Modal.Title>
                <h5 style={{ margin: 0, }}>
                    아이디 및 별칭 변경
                </h5>
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form onSubmit={evt => evt.preventDefault()}>
                <Form.Group>
                    <Form.Label>아이디</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='여기에 새로 사용하실 아이디를 적어주세요.'
                        disabled={nickIdChangeModalState.isProcessing}
                        value={nickIdChangeModalState.idTextFieldValue}
                        onChange={handleInputChange('id')} />
                    <PHFormText>{nickIdChangeModalState.idNotUsableReason}</PHFormText>
                </Form.Group>

                <Form.Group>
                    <Form.Label>별칭</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='여기에 새로 사용하실 별칭을 적어주세요.'
                        disabled={nickIdChangeModalState.isProcessing}
                        value={nickIdChangeModalState.nickTextFieldValue}
                        onChange={handleInputChange('nick')} />
                    <PHFormText>{nickIdChangeModalState.nickNotUsableReason}</PHFormText>
                </Form.Group>
                <PHFormText>{nickIdChangeModalState.nickIdChangeFailedReason}</PHFormText>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button
                variant='secondary'
                onClick={resetToOriginal}
                disabled={nickIdChangeModalState.isProcessing}>
                되돌리기
            </Button>

            <Button
                variant='secondary'
                onClick={closeModalFunc}
                disabled={nickIdChangeModalState.isProcessing}>
                취소
            </Button>

            <PHSpinnerButton
                variant='primary'
                size={false}
                style={{ margin: undefined }}
                onClick={tryAccountInfoChange}
                disabled={shouldSubmitBtnDisabled()}
                showSpinner={nickIdChangeModalState.isProcessing}>
                {getSubmitBtnText()}
            </PHSpinnerButton>
        </Modal.Footer>
    </Modal>;
};
