import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { isEmail } from 'validator';

import { FrostError } from 'src/common/error';
import { AccountInfo } from 'src/redux/modules/account/model';
import {
  signUpActionCreatorAsync,
  removeFrostErrorFromStateActionCreator,
} from 'src/redux/modules/account/action_creator';

import { Form, Button } from 'react-bootstrap';

import { PHSpinnerButton } from 'src/ui/common/element/muButton';
import { PHFormText } from 'src/ui/common/element/muFormText';
import './account.css';

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

export const AccountSignUp = () => {
  const InputChecker = {
    id: (str: string) => {
      if (!str) {
        return {
          success: false,
          idNotUsableReason: '아이디를 입력해주세요.',
        };
      } else if (str.length < 4) {
        return {
          success: false,
          idNotUsableReason: '아이디의 길이가 너무 짧아요, 4자 이상으로 적어주세요.',
        };
      } else if (48 < str.length) {
        return {
          success: false,
          idNotUsableReason: '아이디의 길이가 너무 길어요, 48자 이하로 적어주세요.',
        };
      }

      const strType = calculateIncludedCharType(str);
      if (strType.has('e') || strType.has('s')) {
        return {
          success: false,
          idNotUsableReason: '아이디로 사용할 수 없는 글자가 포함되어 있어요, 다시 입력해주세요.',
        };
      }

      return { success: true, idNotUsableReason: null };
    },
    email: (str: string) => {
      if (!str) {
        return {
          success: false,
          emailNotUsableReason: '이메일을 입력해주세요.',
        };
      }
      if (!isEmail(str)) {
        return {
          success: false,
          emailNotUsableReason: '올바르지 않은 이메일 형식이에요.',
        };
      }

      return {
        success: true,
        emailNotUsableReason: null,
      };
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
    pw: (str: string) => {
      if (!str) {
        return {
          success: false,
          pwNotUsableReason: '사용하실 비밀번호를 입력해주세요,',
        };
      } else if (str.length < 8) {
        return {
          success: false,
          pwNotUsableReason: '길이가 너무 짧아요,',
        };
      } else if (1024 < str.length) {
        return {
          success: false,
          pwNotUsableReason: <>
            {`비밀번호로 ${str.length}자는 너어어어무 길어요!`}<br />
            비밀번호는 1024자 이하로 해 주시고,
          </>
        };
      }

      const strType = calculateIncludedCharType(str);
      if (strType.has('e')) {
        return {
          success: false,
          pwNotUsableReason: '비밀번호로 사용할 수 없는 글자가 포함되어 있어요,',
        };
      } else if (strType.size < 2) {
        return {
          success: false,
          pwNotUsableReason: '비밀번호가 너무 단순해요,'
        };
      }

      return {
        success: true,
        pwNotUsableReason: null,
      };
    },
    pwReType: (pwStr: string, pwReTypeStr: string) => {
      if (!pwReTypeStr) {
        return {
          success: false,
          pwReTypeNotUsableReason: '위에 입력하신 비밀번호를 한번 더 입력해주세요.',
        };
      } else if (pwStr === pwReTypeStr) {
        return {
          success: true,
          pwReTypeNotUsableReason: null,
        };
      }

      return {
        success: false,
        pwReTypeNotUsableReason: '위에 입력하신 비밀번호와 일치하지 않아요.',
      };
    },
  };
  const FrostErrorToSignUpError = (err: FrostError) => {
    if (!err)
      return { signUpFailedReason: null };
    if (err.route !== 'account/signup')
      return { signUpFailedReason: null };
    // We need to set Frost's error message(showMsg)
    // to proper (id|pw|email|nick)NotUsableReason field or signUpFailedReason.
    const errShowMsg = err.message;
    const errFieldName = (err.fieldName) ? `${err.fieldName}NotUsableReason` : 'signUpFailedReason';

    return { [errFieldName]: errShowMsg, };
  };

  const accountInfo: AccountInfo = useSelector(state => state.accountReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signUpFormData, setSignUpFormData] = useState({
    wasUserSignedInWhenPageLoad: undefined,
    isSignedUpRequestFired: false,
    isProcessing: accountInfo?.isFetching ?? false,

    idTextFieldValue: '',
    pwTextFieldValue: '',
    pwReTypeTextFieldValue: '',
    emailTextFieldValue: '',
    nickTextFieldValue: '',

    idNotUsableReason: null,
    nickNotUsableReason: null,
    emailNotUsableReason: null,
    pwNotUsableReason: null,
    pwReTypeNotUsableReasonleReason: null,
    signUpFailedReason: null,

    ...(FrostErrorToSignUpError(accountInfo?.frostErrorObj)),
  });

  useEffect(() => {
    // We need this to remove FrostErrorObj in state when this component mounts.
    dispatch(removeFrostErrorFromStateActionCreator());
  }, []);

  useEffect(() => {
    setSignUpFormData({
      ...signUpFormData,
      ...(signUpFormData.isSignedUpRequestFired ? FrostErrorToSignUpError(accountInfo?.frostErrorObj) : {}),
      isProcessing: accountInfo?.isFetching ?? false,
      wasUserSignedInWhenPageLoad: ((signUpFormData.wasUserSignedInWhenPageLoad === undefined)
        ? accountInfo?.isSignedIn : signUpFormData.wasUserSignedInWhenPageLoad),
    })
  }, [accountInfo]);

  if (signUpFormData.wasUserSignedInWhenPageLoad === undefined) {
    // This is loading state, wait for the new state.
  } else if (signUpFormData.wasUserSignedInWhenPageLoad) {
    // Go to home if user is already on signed in state when page loads.
    navigate('/');
  } else if (!signUpFormData.wasUserSignedInWhenPageLoad && accountInfo?.isSignedIn) {
    // Go to welcome page when user successfully signed up and no mail verification required.
    navigate('/account/welcome-to-mudev', { state: { email: signUpFormData.emailTextFieldValue, } });
  } else if (!signUpFormData.wasUserSignedInWhenPageLoad && accountInfo?.isSignedUp) {
    // Go to mail verification info page when user successfully signed up and mail verification required.
    navigate('/account/welcome-to-mudev-mail', { state: { email: signUpFormData.emailTextFieldValue, } });
  }

  const handleInput = (fieldName: string, fieldValue: string) => {
    const fieldStateKey = `${fieldName}TextFieldValue`;
    const checkerResult = (fieldName === 'pwReType')
      ? InputChecker[fieldName](signUpFormData.pwTextFieldValue, fieldValue)
      : InputChecker[fieldName](fieldValue);
    delete (checkerResult.success);

    setSignUpFormData({
      ...signUpFormData,
      ...checkerResult,
      [fieldStateKey]: fieldValue,
    });
  };
  const handleEnterInput = (e) => {
    if (e.type === 'keypress' && e.charCode === 13)
      trySignUp();
  };
  const trySignUp = () => {
    // Disable all actions
    let newSignUpFormData = {
      ...signUpFormData,
      isSignedUpRequestFired: true,
      isProcessing: true,
    }
    for (var key in newSignUpFormData)
      // trim all strings in states
      if (typeof (newSignUpFormData[key]) === 'string')
        newSignUpFormData[key] = newSignUpFormData[key].trim();
    setSignUpFormData(newSignUpFormData);

    const checkRequiredFieldName = ['id', 'nick', 'email', 'pw', 'pwReType'];
    let isFormCheckSuccess = true;
    let resultFormCheckData = {};
    checkRequiredFieldName.map(fieldName => {
      const fieldValue = newSignUpFormData[`${fieldName}TextFieldValue`];
      const fieldCheckResult = (fieldName === 'pwReType')
        ? InputChecker[fieldName](newSignUpFormData.pwTextFieldValue, fieldValue)
        : InputChecker[fieldName](fieldValue);
      if (isFormCheckSuccess)
        // It's OK to set true to false, but false to true must not be happened.
        isFormCheckSuccess = fieldCheckResult.success;
      resultFormCheckData = { ...resultFormCheckData, ...fieldCheckResult };
    });
    delete (resultFormCheckData.success);

    newSignUpFormData = { ...newSignUpFormData, ...resultFormCheckData, }
    setSignUpFormData(newSignUpFormData);

    if (!isFormCheckSuccess) {
      newSignUpFormData = { ...newSignUpFormData, isProcessing: false, }
      setSignUpFormData(newSignUpFormData);
      return false;
    }

    dispatch(
      signUpActionCreatorAsync(
        newSignUpFormData.idTextFieldValue,
        newSignUpFormData.emailTextFieldValue,
        newSignUpFormData.nickTextFieldValue,
        newSignUpFormData.pwTextFieldValue)
    );

    return false;
  };

  return <section className='accountMain'>
    <header>
      <h2>계정 만들기</h2>
    </header>
    <aside className='accountAside'>
      <Form>
        <Form.Group className='accountAsideFormGroup' controlId='formSignUpId'>
          <Form.Label>아이디</Form.Label>
          <Form.Control
            type='text'
            placeholder='아이디를 입력해주세요'
            autoComplete='username'
            disabled={signUpFormData.isProcessing}
            value={signUpFormData.idTextFieldValue}
            onChange={(event) => handleInput('id', event.target.value)}
          />
          <PHFormText>{signUpFormData.idNotUsableReason}</PHFormText>
        </Form.Group>

        <Form.Group className='accountAsideFormGroup' controlId='formSignUpNick'>
          <Form.Label>별칭</Form.Label>
          <Form.Control
            type='text'
            placeholder='별칭을 입력해주세요'
            autoComplete='nickname'
            disabled={signUpFormData.isProcessing}
            value={signUpFormData.nickTextFieldValue}
            onChange={(event) => handleInput('nick', event.target.value)}
          />
          <PHFormText>{signUpFormData.nickNotUsableReason}</PHFormText>
        </Form.Group>

        <Form.Group className='accountAsideFormGroup' controlId='formSignUpEmail'>
          <Form.Label>이메일</Form.Label>
          <Form.Control
            type='email'
            placeholder='someone@example.com'
            autoComplete='email'
            disabled={signUpFormData.isProcessing}
            value={signUpFormData.emailTextFieldValue}
            onChange={(event) => handleInput('email', event.target.value)}
          />
          <PHFormText>{signUpFormData.emailNotUsableReason}</PHFormText>
        </Form.Group>

        <Form.Group className='accountAsideFormGroup' controlId='formSignUpPassword'>
          <Form.Label>비밀번호</Form.Label>
          <Form.Control
            type='password'
            placeholder='비밀번호'
            autoComplete='new-password'

            disabled={signUpFormData.isProcessing}
            value={signUpFormData.pwTextFieldValue}
            onKeyPress={handleEnterInput}
            onChange={(event) => handleInput('pw', event.target.value)}
          />
          <PHFormText defaultChildren='비밀번호는 8자 이상, 대소문자/숫자/특수문자 중 2가지 이상의 조합으로 입력해주세요.'>
            {signUpFormData.pwNotUsableReason
              ? <>
                {signUpFormData.pwNotUsableReason}<br />
                비밀번호는 8자 이상, 대소문자/숫자/특수문자 중 2가지 이상의 조합으로 입력해주세요.
              </> : ''}
          </PHFormText>
        </Form.Group>

        <Form.Group className='accountAsideFormGroup' controlId='formSignUpPasswordReType'>
          <Form.Label>비밀번호 확인</Form.Label>
          <Form.Control
            type='password'
            placeholder='위에 입력하신 비밀번호를 다시 입력해주세요'
            autoComplete='new-password'
            disabled={signUpFormData.isProcessing}
            value={signUpFormData.pwReTypeTextFieldValue}
            onKeyPress={handleEnterInput}
            onChange={(event) => handleInput('pwReType', event.target.value)}
          />
          <PHFormText>{signUpFormData.pwReTypeNotUsableReason}</PHFormText>
        </Form.Group>

        <PHFormText className='accountAsideFormGroup'>{signUpFormData.signUpFailedReason}</PHFormText>

        <div className='accountSubmitBtnContainer'>
          <Button
            variant='outline-secondary'
            style={{
              color: 'var(--color)',
              border: '1px solid var(--color)',
            }}
            disabled={signUpFormData.isProcessing}
            onClick={() => navigate('/account/signin')}>
            로그인하러 가기
          </Button>

          <PHSpinnerButton
            variant='primary'
            // type='submit'
            size={false}
            style={{ margin: undefined }}
            onClick={trySignUp}
            showSpinner={signUpFormData.isProcessing}>
            계정 만들기
          </PHSpinnerButton>
        </div>
      </Form>
    </aside>
  </section>;
}
