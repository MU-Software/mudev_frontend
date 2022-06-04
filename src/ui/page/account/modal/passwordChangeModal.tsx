import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Modal, Button } from "react-bootstrap";
import { FrostError } from 'src/common/error';

import { PHFormText } from 'src/ui/common/element/muFormText';
import { PHSpinnerButton } from 'src/ui/common/element/muButton';
import { AccountInfo } from 'src/redux/modules/account/model';
import FrostAPI from 'src/network/api';

interface AccountPasswordChangeModalStateType {
    isProcessing: boolean;

    currentPwTextFieldValue: string;
    currentPwNotUsableReason: string;
    newPwTextFieldValue: string;
    newPwNotUsableReason: string;
    newPwReTypeTextFieldValue: string;
    newPwReTypeNotUsableReason: string;
    pwChangeFailedReason: string;
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

export const AccountPasswordChangeModal: React.FC = (props: {
    modalShowState: boolean;
    setModalShowState: (boolean) => void;
}) => {
    const InputChecker = {
        currentPw: (str: string) => {
            if (!str) {
                return {
                    success: false,
                    currentPwNotUsableReason: '현재 사용 중인 비밀번호를 입력해주세요.',
                };
            }

            return {
                success: true,
                currentPwNotUsableReason: null,
            };
        },
        newPw: (currentPwStr: string, newPwStr: string) => {
            if (!newPwStr) {
                return {
                    success: false,
                    newPwNotUsableReason: '새 비밀번호를 입력해주세요,\n',
                };
            } else if (!currentPwStr) {
                return {
                    success: false,
                    newPwNotUsableReason: '현재 사용 중인 비밀번호를 먼저 입력해주세요,\n',
                };
            } else if (currentPwStr === newPwStr) {
                return {
                    success: false,
                    newPwNotUsableReason:
                        '새로운 비밀번호가 현재 사용 중으로 적으신 비밀번호와 같아요,\n'
                        + '다른 비밀번호를 적어주세요.\n',
                };
            } else if (newPwStr.length < 8) {
                return {
                    success: false,
                    newPwNotUsableReason: '새 비밀번호의 길이가 너무 짧아요,\n',
                };
            } else if (1024 < newPwStr.length) {
                return {
                    success: false,
                    newPwNotUsableReason:
                        `새 비밀번호로 ${newPwStr.length}자는 너어어어무 길어요!\n`
                        + '새 비밀번호는 1024자 이하로 해 주시고,\n',
                };
            }

            const strType = calculateIncludedCharType(newPwStr);
            if (strType.has('e')) {
                return {
                    success: false,
                    newPwNotUsableReason: '새로운 비밀번호에 사용할 수 없는 글자가 포함되어 있어요,',
                };
            } else if (strType.size < 2) {
                return {
                    success: false,
                    newPwNotUsableReason: '새 비밀번호가 너무 단순해요,'
                };
            }

            return {
                success: true,
                newPwNotUsableReason: null,
            };
        },
        newPwReType: (pwStr: string, pwReTypeStr: string) => {
            if (!pwReTypeStr) {
                return {
                    success: false,
                    newPwReTypeNotUsableReason: '위에 입력하신 새 비밀번호를 한번 더 입력해주세요.',
                };
            } else if (pwStr === pwReTypeStr) {
                return {
                    success: true,
                    newPwReTypeNotUsableReason: null,
                };
            }

            return {
                success: false,
                newPwReTypeNotUsableReason: '위에 입력하신 새 비밀번호와 일치하지 않아요.',
            };
        },
    };
    const FrostErrorToPasswordChangeError = (err: FrostError) => {
        if (!err)
            return { signUpFailedReason: null };
        if (err.route !== 'account/change-password')
            return { signUpFailedReason: null };
        // We need to set Frost's error message(showMsg)
        // to proper (currentPw|newPw|newPwReType)NotUsableReason field or pwChangeFailedReason.
        const errShowMsg = err.message;
        const errFieldName = (err.fieldName) ? `${err.fieldName}NotUsableReason` : 'pwChangeFailedReason';

        return { [errFieldName]: errShowMsg, };
    };

    const passwordRuleText = '비밀번호는 8자 이상, 대소문자/숫자/특수문자 중 2가지 이상의 조합으로 입력해주세요.';

    const navigate = useNavigate();
    const [passwordChangeModalState, setPasswordChangeModalState] = useState({
        isProcessing: false,

        currentPwTextFieldValue: '',
        currentPwNotUsableReason: '',
        newPwTextFieldValue: '',
        newPwNotUsableReason: '',
        newPwReTypeTextFieldValue: '',
        newPwReTypeNotUsableReason: '',
        pwChangeFailedReason: '',
    });
    useEffect(() => setPasswordChangeModalState({
        ...passwordChangeModalState,

        currentPwTextFieldValue: '',
        currentPwNotUsableReason: '',
        newPwTextFieldValue: '',
        newPwNotUsableReason: '',
        newPwReTypeTextFieldValue: '',
        newPwReTypeNotUsableReason: '',
        pwChangeFailedReason: '',
    }), [props.modalShowState]);

    const closeModalFunc = () => {
        if (!passwordChangeModalState.isProcessing)
            props.setModalShowState(false);
    };

    const getTrimmedState = (modalState?: AccountPasswordChangeModalStateType) => {
        const tempModalState: AccountPasswordChangeModalStateType = { ...(modalState ?? passwordChangeModalState), };
        for (const key in tempModalState)
            if (typeof (tempModalState[key]) === 'string')
                tempModalState[key] = tempModalState[key].trim();

        return tempModalState;
    };
    const handleInputChange = (fieldName: string) => (e: Event) => {
        const fieldStateKey = `${fieldName}TextFieldValue`;
        const fieldValue = (e.target.type === 'checkbox') ? e.target.checked : e.target.value;

        let fieldCheckResult = undefined;
        switch (fieldName) {
            case 'newPw':
                fieldCheckResult = InputChecker['newPw'](passwordChangeModalState.currentPwTextFieldValue.trim(), fieldValue);
                break;
            case 'newPwReType':
                fieldCheckResult = InputChecker['newPwReType'](passwordChangeModalState.newPwTextFieldValue.trim(), fieldValue);
                break;
            case 'currentPw':
            default:
                fieldCheckResult = InputChecker[fieldName](fieldValue);
                break;
        }
        delete (fieldCheckResult.success);

        setPasswordChangeModalState((prevState) => ({
            ...prevState,
            ...fieldCheckResult,
            [fieldStateKey]: fieldValue,
        }));
    };

    const shouldSubmitBtnDisabled = () => {
        if (passwordChangeModalState.isProcessing)
            return true;

        const tempModalState = getTrimmedState();
        let isFormCheckSuccess = true;
        ['currentPw', 'newPw', 'newPwReType'].map(fieldName => {
            const fieldValue: string = tempModalState[`${fieldName}TextFieldValue`];
            let fieldCheckResult = undefined;
            switch (fieldName) {
                case 'newPw':
                    fieldCheckResult = InputChecker['newPw'](passwordChangeModalState.currentPwTextFieldValue.trim(), fieldValue);
                    break;
                case 'newPwReType':
                    fieldCheckResult = InputChecker['newPwReType'](passwordChangeModalState.newPwTextFieldValue.trim(), fieldValue);
                    break;
                case 'currentPw':
                default:
                    fieldCheckResult = InputChecker[fieldName](fieldValue);
                    break;
            }

            if (isFormCheckSuccess)
                // It's OK to set true to false, but false to true must not be happened.
                // And also, we are in a map function, so we cannot return directly here,
                // we need to store the result somewhere outside of the function.
                isFormCheckSuccess = fieldCheckResult.success;
        });

        return !isFormCheckSuccess;
    };

    const resetToOriginal = () => {
        setPasswordChangeModalState({
            ...passwordChangeModalState,

            currentPwTextFieldValue: '',
            currentPwNotUsableReason: '',
            newPwTextFieldValue: '',
            newPwNotUsableReason: '',
            newPwReTypeTextFieldValue: '',
            newPwReTypeNotUsableReason: '',
        });
    };
    const tryAccountPasswordChange = () => {
        // Trim all strings in states
        const tempModalState = getTrimmedState();
        setPasswordChangeModalState(prevState => ({
            ...prevState,
            ...tempModalState,
            isProcessing: true,
        }));

        let isFormCheckSuccess = true;
        let resultFormCheckData = {};
        ['currentPw', 'newPw', 'newPwReType'].map(fieldName => {
            const fieldValue = tempModalState[`${fieldName}TextFieldValue`];
            let fieldCheckResult = undefined;
            switch (fieldName) {
                case 'newPw':
                    fieldCheckResult = InputChecker['newPw'](passwordChangeModalState.currentPwTextFieldValue.trim(), fieldValue);
                    break;
                case 'newPwReType':
                    fieldCheckResult = InputChecker['newPwReType'](passwordChangeModalState.newPwTextFieldValue.trim(), fieldValue);
                    break;
                case 'currentPw':
                default:
                    fieldCheckResult = InputChecker[fieldName](fieldValue);
                    break;
            }

            if (isFormCheckSuccess)
                // It's OK to set true to false, but false to true must not be happened.
                // And also, we are in a map function, so we cannot return directly here,
                // we need to store the result somewhere outside of the function.
                isFormCheckSuccess = fieldCheckResult.success;

            resultFormCheckData = { ...resultFormCheckData, ...fieldCheckResult };
        });
        delete (resultFormCheckData.success);

        setPasswordChangeModalState(prevState => ({
            ...prevState,
            ...resultFormCheckData,
            isProcessing: isFormCheckSuccess,
        }));

        if (!isFormCheckSuccess)
            return;

        (new FrostAPI()).changePassword(
            tempModalState.currentPwTextFieldValue,
            tempModalState.newPwTextFieldValue,
            tempModalState.newPwReTypeTextFieldValue)
            .then(
                () => {
                    setPasswordChangeModalState(prevState => ({ ...prevState, isProcessing: false, }));
                    alert('비밀번호가 변경되었습니다!');
                    closeModalFunc();
                },
                (reason: FrostError) => {
                    setPasswordChangeModalState(prevState => ({
                        ...prevState,
                        isProcessing: false,
                        ...FrostErrorToPasswordChangeError(reason),
                    }));
                }
            );
    };

    return <Modal
        show={props.modalShowState}
        onHide={closeModalFunc}
        backdrop='static'
        centered >
        <Modal.Header closeButton>
            <Modal.Title>
                <h5 style={{ margin: 0, }}>
                    비밀번호 변경
                </h5>
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form onSubmit={evt => evt.preventDefault()}>
                <Form.Group>
                    <Form.Label>현재 비밀번호</Form.Label>
                    <Form.Control
                        type='password'
                        autoComplete='current-password'
                        placeholder='여기에 현재 사용 중인 비밀번호를 적어주세요.'
                        disabled={passwordChangeModalState.isProcessing}
                        value={passwordChangeModalState.currentPwTextFieldValue}
                        onChange={handleInputChange('currentPw')} />
                    <PHFormText>{passwordChangeModalState.currentPwNotUsableReason}</PHFormText>
                </Form.Group>

                <Form.Group>
                    <Form.Label>새 비밀번호</Form.Label>
                    <Form.Control
                        type='password'
                        autoComplete='new-password'
                        placeholder='여기에 새로 사용하실 비밀번호를 적어주세요.'
                        disabled={passwordChangeModalState.isProcessing}
                        value={passwordChangeModalState.newPwTextFieldValue}
                        onChange={handleInputChange('newPw')} />
                    <PHFormText defaultChildren={passwordRuleText}>
                        {passwordChangeModalState.newPwNotUsableReason
                            ? passwordChangeModalState.newPwNotUsableReason + passwordRuleText : ''}
                    </PHFormText>
                </Form.Group>

                <Form.Group>
                    <Form.Label>새 비밀번호 확인</Form.Label>
                    <Form.Control
                        type='password'
                        autoComplete='new-password'
                        placeholder='여기에 위에 입력하신 새 비밀번호를 다시 적어주세요.'
                        disabled={passwordChangeModalState.isProcessing}
                        value={passwordChangeModalState.newPwReTypeTextFieldValue}
                        onChange={handleInputChange('newPwReType')} />
                    <PHFormText>{passwordChangeModalState.newPwReTypeNotUsableReason}</PHFormText>
                </Form.Group>

                <PHFormText>{passwordChangeModalState.pwChangeFailedReason}</PHFormText>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button
                variant='secondary'
                onClick={resetToOriginal}
                disabled={passwordChangeModalState.isProcessing}>
                초기화
            </Button>

            <Button
                variant='secondary'
                onClick={closeModalFunc}
                disabled={passwordChangeModalState.isProcessing}>
                취소
            </Button>

            <PHSpinnerButton
                variant='primary'
                size={false}
                style={{ margin: undefined }}
                onClick={tryAccountPasswordChange}
                disabled={shouldSubmitBtnDisabled()}
                showSpinner={passwordChangeModalState.isProcessing}>
                비밀번호 변경
            </PHSpinnerButton>
        </Modal.Footer>
    </Modal>;
};
