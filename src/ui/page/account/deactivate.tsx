import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { accountDeactivateActionCreatorAsync } from 'src/redux/modules/account/action_creator';

import { Form, Button } from 'react-bootstrap';
import { PHSpinnerButton } from 'src/ui/common/element/muButton';
import { PHFormText } from 'src/ui/common/element/muFormText';

import { AccountInfo } from 'src/redux/modules/account/model';
import './account.css';

interface AccountDeactivateStateType {
  isInitialized: boolean;
  isProcessing: boolean;

  pwTextFieldValue: string;
  pwNotUsableReason: string;
  accountDeactivateFailedReason: string;
}

export const AccountDeactivate = () => {
  const InputChecker = {
    pw: (str: string) => {
      if (!str) {
        return {
          success: false,
          pwNotUsableReason: '비밀번호를 입력해주세요.',
        };
      }

      return { success: true, pwNotUsableReason: null };
    },
  };
  const FrostErrorToAccountDeactivationError = (err: FrostError) => {
    if (!err)
      return { signUpFailedReason: null };
    if (err.route !== 'account/deactivate')
      return { signUpFailedReason: null };
    // We need to set Frost's error message(showMsg)
    // to proper pwNotUsableReason field or accountDeactivateFailedReason.
    const errShowMsg = err.message;
    const errFieldName = (err.fieldName) ? `${err.fieldName}NotUsableReason` : 'pwChangeFailedReason';

    return { [errFieldName]: errShowMsg, };
  };

  const accountInfo: AccountInfo = useSelector(state => state.accountReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [accountDeactivateFormData, setAccountDeactivateFormData] = useState({
    isInitialized: false,
    isProcessing: false,

    pwTextFieldValue: '',
    pwNotUsableReason: '',
    accountDeactivateFailedReason: '',
  });
  useEffect(() => {
    if (!accountDeactivateFormData.isInitialized && !accountInfo.isFetching) {
      setAccountDeactivateFormData(prevState => ({
        ...prevState,
        isInitialized: true,
      }));
    }

    if (accountDeactivateFormData.isInitialized && !accountInfo.isFetching) {
      if (!accountDeactivateFormData.isProcessing && !accountInfo.isSignedIn) {
        // User got this page without signing in.
        alert('로그인 후에 사용하실 수 있어요.');
        navigate('/');
      } else if (accountDeactivateFormData.isProcessing && accountInfo.frostErrorObj) {
        // Error raised while deactivating account, parse error and show proper message.
        if (accountInfo.frostErrorObj.apiResponse?.subCode === 'user.deactivated') {
          alert(accountInfo.frostErrorObj.message);
          setAccountDeactivateFormData(prevState => ({
            ...prevState,
            isProcessing: false,
          }));
          navigate('/');
          return;
        }
        setAccountDeactivateFormData(prevState => ({
          ...prevState,
          isProcessing: false,
          ...FrostErrorToAccountDeactivationError(accountInfo.frostErrorObj),
        }));
      } else if (accountDeactivateFormData.isProcessing && !accountInfo.isSignedIn) {
        // User successfully deactivated.
        alert('계정이 정상적으로 비활성화됐어요,\n이용해주셔서 감사합니다!');
        setAccountDeactivateFormData(prevState => ({
          ...prevState,
          isProcessing: false,
        }));
        navigate('/');
      }
    }
  }, [accountInfo, accountDeactivateFormData.isInitialized, accountDeactivateFormData.isProcessing]);

  const getTrimmedState = (modalState?: AccountDeactivateStateType) => {
    const tempModalState: AccountDeactivateStateType = { ...(modalState ?? accountDeactivateFormData), };
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

    setAccountDeactivateFormData((prevState) => ({
      ...prevState,
      ...checkerResult,
      [fieldStateKey]: fieldValue,
    }));
  };

  const shouldSubmitBtnDisabled = () => {
    if (accountDeactivateFormData.isProcessing)
      return true;

    const tempModalState = getTrimmedState();
    let isFormCheckSuccess = true;
    ['pw',].map(fieldName => {
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

  const tryAccountDeactivate = () => {
    // Trim all strings in states
    const tempModalState = getTrimmedState();
    setAccountDeactivateFormData(prevState => ({
      ...prevState,
      ...tempModalState,
      isProcessing: true,
    }));

    let isFormCheckSuccess = true;
    let resultFormCheckData = {};
    ['pw',].map(fieldName => {
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

    setAccountDeactivateFormData(prevState => ({
      ...prevState,
      ...resultFormCheckData,
      isProcessing: isFormCheckSuccess,
    }));

    if (!isFormCheckSuccess)
      return;

    dispatch(accountDeactivateActionCreatorAsync(
      accountInfo.email,
      tempModalState.pwTextFieldValue,
    ));
  };

  let accountDeactivateDescription = '계정을 비활성화 시 생성하신 PlayCo의 재생목록이 차단 상태로 되고,\n';
  accountDeactivateDescription += '이 이메일로 MUdev.cc에 다시 가입을 하실 수 없으며, 비활성화는 되돌릴 수 없어요!\n';
  accountDeactivateDescription += '계속 진행하시려면 아래에 현재 비밀번호를 입력 후\n<비활성화하기> 버튼을 눌러주세요.\n';

  return <section className='accountMain'>
    <header>
      <h2>계정 비활성화</h2>
    </header>
    <aside className='accountAside'>
      <Form>
        <Form.Group className="accountAsideFormGroup" controlId="formBasicEmail">
          <Form.Label>계정을 정말 비활성화 하실건가요?</Form.Label>
          <PHFormText defaultChildren={accountDeactivateDescription} />
        </Form.Group>

        <Form.Group>
          <Form.Label>비밀번호</Form.Label>
          <Form.Control
            type='password'
            autoComplete='current-password'
            placeholder='여기에 현재 사용 중이신 비밀번호를 적어주세요.'
            disabled={accountDeactivateFormData.isProcessing}
            value={accountDeactivateFormData.pwTextFieldValue}
            onChange={handleInputChange('pw')} />
          <PHFormText>{accountDeactivateFormData.pwNotUsableReason}</PHFormText>
        </Form.Group>

        <PHFormText>{accountDeactivateFormData.accountDeactivateFailedReason}</PHFormText>

        <div className='accountSubmitBtnContainer'>
          <Button
            variant='primary'
            disabled={accountDeactivateFormData.isProcessing}
            onClick={() => navigate(-1)}>
            취소하기
          </Button>

          <PHSpinnerButton
            variant='danger'
            type='submit'
            size={false}
            style={{ margin: undefined }}
            disabled={shouldSubmitBtnDisabled()}
            onClick={tryAccountDeactivate}
            showSpinner={accountDeactivateFormData.isProcessing}>
            비활성화하기
          </PHSpinnerButton>
        </div>
      </Form>
    </aside>
  </section>;
};
