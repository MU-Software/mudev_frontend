import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { FrostError } from 'src/common/error';
import {
  signInActionCreatorAsync,
  removeFrostErrorFromStateActionCreator,
} from 'src/redux/modules/account/action_creator';
import { AccountInfo } from 'src/redux/modules/account/model';

import { Form, Button } from 'react-bootstrap';

import { PHSpinnerButton } from 'src/ui/common/element/muButton';
import { PHFormText } from 'src/ui/common/element/muFormText';
import './account.css';

export const AccountSignIn = () => {
  const InputChecker = {
    id: (str: string) => {
      if (!str)
        return { success: false, idNotUsableReason: '아이디나 이메일 주소를 입력해주세요.', };

      return { success: true, idNotUsableReason: null };
    },
    pw: (str: string) => {
      if (!str)
        return { success: false, pwNotUsableReason: '비밀번호를 입력해주세요.', };

      return { success: true, pwNotUsableReason: null, };
    },
  };

  const FrostErrorToSignInError = (err: FrostError) => {
    if (!err)
      return { signInFailedReason: null };
    if (err.route !== 'account/signin')
      return { signUpFailedReason: null };
    // We need to set Frost's error message(showMsg)
    // to proper (id|pw|email|nick)NotUsableReason field or signInFailedReason.
    const errShowMsg = err.message;
    const errFieldName = err.fieldName ? `${err.fieldName}NotUsableReason` : 'signInFailedReason';

    return { [errFieldName]: errShowMsg, };
  };

  const accountInfo: AccountInfo = useSelector(state => state.accountReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signInFormData, setSignInFormData] = useState({
    isProcessing: accountInfo?.isFetching ?? false,

    idTextFieldValue: '',
    pwTextFieldValue: '',

    idNotUsableReason: null,
    pwNotUsableReason: null,
    signInFailedReason: null,

    ...(FrostErrorToSignInError(accountInfo?.frostErrorObj)),
  });

  useEffect(() => {
    setSignInFormData({
      ...signInFormData,
      ...(FrostErrorToSignInError(accountInfo?.frostErrorObj)),
      isProcessing: accountInfo?.isFetching ?? false,
    })
  }, [accountInfo]);

  // We need this to remove FrostErrorObj in state when this component mounts.
  useEffect(() => dispatch(removeFrostErrorFromStateActionCreator()), []);

  if (accountInfo?.isSignedIn) // Go to home if user is signed in state.
    navigate('/');
  const handleEnterInput = (e) => {
    if (e.type === 'keypress' && e.charCode === 13)
      trySignIn();
  };
  const trySignIn = () => {
    // Disable all actions
    let newSignInFormData = { ...signInFormData, isProcessing: true, };
    for (var key in newSignInFormData)
      // trim all strings in states
      if (typeof (newSignInFormData[key]) === 'string')
        newSignInFormData[key] = newSignInFormData[key].trim();
    setSignInFormData(newSignInFormData);

    const checkRequiredFieldName = ['id', 'pw'];
    let isFormCheckSuccess = true;
    let resultFormCheckData = {};
    checkRequiredFieldName.map(fieldName => {
      const fieldValue = signInFormData[`${fieldName}TextFieldValue`];
      const fieldCheckResult = InputChecker[fieldName](fieldValue);
      if (isFormCheckSuccess)
        // It's OK to set true to false, but false to true must not be happened.
        isFormCheckSuccess = fieldCheckResult.success;
      resultFormCheckData = { ...resultFormCheckData, ...fieldCheckResult };
    });
    delete (resultFormCheckData.success);

    newSignInFormData = { ...newSignInFormData, ...resultFormCheckData, }
    setSignInFormData(newSignInFormData);

    if (!isFormCheckSuccess) {
      newSignInFormData = { ...newSignInFormData, isProcessing: false, }
      setSignInFormData(newSignInFormData);
      return false;
    }

    dispatch(
      signInActionCreatorAsync(
        newSignInFormData.idTextFieldValue,
        newSignInFormData.pwTextFieldValue)
    );

    return false;
  };

  return <section className='accountMain'>
    <header>
      <h2>로그인</h2>
    </header>
    <aside className='accountAside'>
      <Form>
        <Form.Group className='accountAsideFormGroup' controlId='formBasicEmail'>
          <Form.Label>아이디 또는 이메일</Form.Label>
          <Form.Control
            type='text'
            autoComplete='username'
            placeholder='ID / Email'
            disabled={signInFormData.isProcessing}
            value={signInFormData.idTextFieldValue}
            onKeyPress={handleEnterInput}
            onChange={
              (event) => setSignInFormData({
                ...signInFormData,
                idTextFieldValue: event.target.value,
              })}
          />
          <PHFormText>{signInFormData.idNotUsableReason}</PHFormText>
        </Form.Group>

        <Form.Group className='accountAsideFormGroup' controlId='formBasicPassword'>
          <Form.Label>비밀번호</Form.Label>
          <Form.Control
            type='password'
            autoComplete='current-password'
            placeholder='비밀번호'
            disabled={signInFormData.isProcessing}
            value={signInFormData.pwTextFieldValue}
            onKeyPress={handleEnterInput}
            onChange={
              (event) => setSignInFormData({
                ...signInFormData,
                pwTextFieldValue: event.target.value,
              })}
          />
          <PHFormText>{signInFormData.pwNotUsableReason}</PHFormText>
        </Form.Group>

        <PHFormText showOnlyNeeded className='accountAsideFormGroup'>{signInFormData.signInFailedReason}</PHFormText>

        <div className='accountSubmitBtnContainer'>
          <Button
            variant='outline-secondary'
            style={{
              color: 'var(--color)',
              border: '1px solid var(--color)',
            }}
            disabled={signInFormData.isProcessing}
            onClick={() => navigate('/account/signup')}>
            계정 만들기
          </Button>

          <PHSpinnerButton
            variant='primary'
            size={false}
            style={{ margin: undefined }}
            onClick={trySignIn}
            showSpinner={signInFormData.isProcessing}>
            로그인
          </PHSpinnerButton>
        </div><br />
        <a
          className='signInGoToResetPassword'
          href='#'
          onClick={(!signInFormData.isProcessing) ? () => navigate('/account/reset-password') : () => {/**/ }}>
          비밀번호를 잊어버리셨나요?
        </a>
      </Form>
    </aside>
  </section>;
}
