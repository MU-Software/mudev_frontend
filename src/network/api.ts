// (c) MUsoftware 2022
'use strict';

import { FrostError } from '../common/error';
import { APIResult } from './api_response';

const HTTP_METHOD: Record<string, string> = {
  // We will support only these methods for now
  HEAD: 'HEAD',
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

const role2Object = (roleStr: string) => {
  const result: { [roleName: string]: string | boolean } = {};

  roleStr.split("&").forEach(function (part) {
    const item = part.split("=");
    if (item.length == 2) {
      result[item[0]] = decodeURIComponent(item[1]);
      if (result[item[0]] === 'true' || result[item[0]] === 'false')
        result[item[0]] = (result[item[0]] === 'true') ? true : false;
    }
  });

  return result;
}

// From https://stackoverflow.com/a/40031979
const buf2hex = (buffer: ArrayBufferLike) => {
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

// Generate random safe string
const generateRandomSecureToken = (bytes: number) => {
  const randArray = new Uint32Array(bytes);
  window.crypto.getRandomValues(randArray);
  return buf2hex(randArray);
}

interface FrostAPIRequestArgumentTypes {
  method: 'HEAD' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  accessTokenRequired: boolean;
  additionalHeaders: Record<string, unknown>;
  data: Record<string, unknown>;
  isRetry: boolean;
}

interface FrostAccountModifiableInfoTypes {
  id: string;
  nickname: string;
  private: boolean;
  description: string;
}

let frostApiInstance: FrostAPI;
class FrostAPI {
  // We only uses these http methods now.
  static readonly #API_USED_METHOD = [
    // HTTP_METHOD.HEAD,  // NOT ALLOWED YET!!!
    HTTP_METHOD.GET,
    HTTP_METHOD.POST,
    HTTP_METHOD.PUT,
    HTTP_METHOD.PATCH,
    HTTP_METHOD.DELETE,
  ]
  // Refresh Token will be saved on cookie storage,
  // And all of these attributes must be private.
  readonly #BASE_URL = 'https://mudev.cc/api/dev/';
  // We "possibly" returns response.json() on these HTTP Response status code.
  // Although these HTTP Response status code means error,
  // each routes have to handle these codes differently.
  static readonly RETURNABLE_ERROR = [
    // Actually, on 404, we need to filter http.not_found out only,
    // and any other responses must be returned, but we can get subcode after response.json().
    // And response.json() returns Promise<Any> and we cannot get subCode directly,
    // so we need to handle 404 on second stage.
    404, // http || resource not found
    409, // already used / information mismatch, conflict
    410, // resource gone
    412, // resource prediction failed
    422, // request.body.bad_semantics - email address validation failure, etc.
  ];
  // Default fetch options,
  // we'll copy and modify this default option object on every request.
  readonly #DEFAULT_FETCH_OPTION = {
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'strict-origin-when-cross-origin',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Account related properties
  #csrfToken: string = '';
  #accessToken: string = '';
  #accessTokenExpiresAt: Date = new Date('Thu, 01 Jan 1970 00:00:00 GMT');
  #refreshResult?: APIResult['data'] | null = null;

  constructor() {
    if (frostApiInstance) return frostApiInstance;

    this.#csrfToken = generateRandomSecureToken(32);
    frostApiInstance = this;
  }

  #clearAuthenticationInfo() {
    this.#accessToken = '';
    this.#accessTokenExpiresAt = new Date('Thu, 01 Jan 1970 00:00:00 GMT');
    this.#csrfToken = generateRandomSecureToken(32);
    this.#refreshResult = null;
  }

  #apiRequest({ method, url, accessTokenRequired, additionalHeaders, data, isRetry }: FrostAPIRequestArgumentTypes = {
    method: HTTP_METHOD.GET,
    url: '',
    accessTokenRequired: false,
    additionalHeaders: {},
    data: {},
    isRetry: false,
  }): Promise<APIResult> {
    // check if requested method is allowed
    if (FrostAPI.#API_USED_METHOD.indexOf(method) == -1) { throw 'NOT_ALLOWED_METHOD'; }

    // deep copy fetch option object
    const reqFetchOption = JSON.parse(JSON.stringify(this.#DEFAULT_FETCH_OPTION));
    reqFetchOption.method = method;

    // only add body on POST/PATCH/PUT methods
    if ([HTTP_METHOD.POST, HTTP_METHOD.PATCH, HTTP_METHOD.PUT].indexOf(method) > -1)
      reqFetchOption.body = JSON.stringify(data);

    // always send X-Csrf-Token. This won't be a security hole.
    reqFetchOption.headers['X-Csrf-Token'] = this.#csrfToken;
    // add access token on header if accessTokenRequired is true
    if (accessTokenRequired) {
      reqFetchOption.headers['Authorization'] = 'Bearer ' + this.#accessToken;
    }

    if (url.includes('account') || url.includes('admin')) {
      reqFetchOption.credentials = 'include';
    }

    if (additionalHeaders)
      for (const [key, value] of Object.entries(additionalHeaders))
        reqFetchOption.headers[key] = value;

    // // We need to handle HEAD method separately as this method doesn't return any body.
    // if (method === HTTP_METHOD.HEAD) {
    //   return fetch(this.#BASE_URL + url, reqFetchOption).then((response) => {

    //   });
    // }

    return fetch(this.#BASE_URL + url, reqFetchOption).then((response) => {
      if (!response) {
        // How is this possible???
        throw new FrostError(
          '서버가 응답이 없어요,\n잠시 후에 다시 시도해주세요.',
          'fetchResult 객체가 undefined 또는 null입니다.', -1, false, undefined, undefined, url);
      } else if (200 <= response.status && response.status <= 399) {  // this returns response.json()
        // SUCCESS

        if (response.status === 204) { // resource.deleted
          // As 204 response means that resource is deleted and response does not include a response body,
          // we need to make and return a fake response object.
          return {
            header: response.headers,
            body: {
              success: true,
              code: 204,
              subCode: 'resource.deleted',
              message: 'Resource successfully deleted',
            },
          };
        }

        return response.json().then((responseBody) => ({ header: response.headers, body: responseBody }));
      } else if (400 <= response.status && response.status <= 499) {
        if (response.status === 401) {  // this "possibly" returns response.json()
          // This code can be returned on both resource and account related routes,
          // and we need to handle those separately.
          //
          // Possible subCodes:
          // > wrong password / account locked / account deactivated (== maybe one of account related routes?)
          //    - These will be raised when we signing in.
          //      We need to throw a proper FrostError.
          // > token not given / token expired / token invalid
          //    - We need to try refreshing access token and retry this.
          //      If access token refresh fails, then raise errors.
          //
          // If the error-occurred-request is related to resource routes,
          // then we'll refresh access token and and retry the request.
          // and if it fails, then we'll throw FrostError.
          //
          // If the error-occurred-request is related to account routes,
          // then we need to parse subCode, so we'll handle this error on second stage.
          if (!url.startsWith('account/')) {
            if (!isRetry)
              return this.refreshAuthentications(true).then((api) => api.#apiRequest({
                method: method,
                url: url,
                accessTokenRequired: accessTokenRequired,
                additionalHeaders: additionalHeaders, data: data,
                isRetry: true,
              }));
            throw new FrostError(
              '인증 정보 갱신에 실패했어요,\n다시 로그인해주세요.',
              '인증 실패 & url !== account/refresh\n' + `${url} | ${method} | response.status === ${response.status}`,
              response.status, false, undefined, undefined, url);
          }

          return response.json().then((responseBody) => ({ header: response.headers, body: responseBody }));
        } else if (FrostAPI.RETURNABLE_ERROR.includes(response.status)) {
          // this "possibly" returns response.json().
          // See RETURNABLE_ERROR for more details.
          return response.json().then((responseBody) => ({ header: response.headers, body: responseBody }));
        } else if (response.status === 403) {
          // Requested action was forbidden
          throw new FrostError(
            '해당 동작에 대한 권한이 없습니다.\n만약 권한을 가지고 계셔야 한다면 관리자에게 연락 부탁드립니다.',
            `${url} | ${method} | response.status === ${response.status}`, response.status,
            false, undefined, undefined, url);
        } else if (response.status === 405) {
          // Method not permitted
          throw new FrostError(
            '잘못된 요청입니다.\n사이트 관리자에게 어떻게 이 메시지를 보게 됐는지 알려주시면 감사하겠습니다ㅠㅜ',
            `${url} | ${method} | response.status === ${response.status}`, response.status,
            false, undefined, undefined, url);
        } else if (response.status === 415) {
          // requested response content-type not supported
          throw new FrostError(
            '잘못된 요청입니다.\n사이트 관리자에게 어떻게 이 메시지를 보게 됐는지 알려주시면 감사하겠습니다ㅠㅜ',
            `${url} | ${method} | response.status === ${response.status}`, response.status,
            false, undefined, undefined, url);
        } else if (response.status === 429) {
          throw new FrostError(
            '요청이 너무 빈번해요,\n조금 천천히 진행해주세요.',
            `429 rate limit`, 429, false, undefined, undefined, url);
        } else {
          // unknown client-fault error
          throw new FrostError(
            '알 수 없는 문제가 발생하였습니다,\n10분 후 다시 시도해주세요.',
            `${url} | ${method} | response.status === ${response.status}`, response.status,
            false, undefined, undefined, url);
        }
      } else {  // HTTP status code is more than 500(server error)
        throw new FrostError(
          '서버가 잠시 문제가 생겼어요,\n10분 후에 다시 시도해주세요.',
          `statusCode가 ${response.status}입니다.`, response.status,
          false, undefined, undefined, url);
      }

      // This is just for type-checking, response.status won't be less than 200, right?
      // ...right? please... no......
      return response.json().then((responseBody) => ({ header: response.headers, body: responseBody }));
    }).then((response: { header: Record<string, unknown>, body: Record<string, unknown> } | APIResult) => {
      if (response instanceof APIResult)
        return response;

      const apiResult = new APIResult(response);
      if (apiResult.code === 404 && apiResult.subCode === 'http.not_found') {
        throw new FrostError(
          '무엇을 할 지 모르는 요청이에요,\n사이트 개발자에게 문의해주세요ㅠㅜ',
          'http.not_found입니다.', apiResult.code, false, apiResult, undefined, url);
      }
      // else if (apiResult.code === 401) {
      //   // Possible subCodes:
      //   // > token not given / token expired / token invalid
      //   //   (== resource related routes, !!!ALREADY HANDLED!!!)
      //   //    - We need to try refreshing access token and retry this.
      //   //      If access token refresh fails, then raise errors.
      //   // > wrong password / account locked / account deactivated
      //   //   (== account related routes, we need to handle this here.)
      //   //    - These will be raised when we signing in.
      //   //      We need to throw a proper FrostError.
      //   throw new FrostError(
      //     '로그인을 할 수 없어요.',
      //     '인증 실패 & url !== account/refresh\n' + `${url} | ${method} | response.status === ${response.status}`,
      //     apiResult.code, true, apiResult, undefined, url);
      // }

      return apiResult;
    }).catch((reason) => {
      // catch all exceptions and change it to FrostError
      if (typeof (reason) === 'object' && reason.constructor.name === 'FrostError') {
        throw reason;
      } else {
        throw new FrostError(
          '알 수 없는 문제가 생겼어요,\n10분 후에 다시 시도해주세요.',
          `on FrostAPI.#apiRequest -> reason = ${reason}`, -1, false, undefined, undefined, url);
      }
    });
  }

  isSignedInWithoutAsync() {
    return (this.#accessToken) ? true : false;
  }

  isSignedIn(checkNetwork = false) {
    if (checkNetwork)
      return this.refreshAuthentications().then((_) => true, (_) => false);

    return Promise.resolve((this.#accessToken) ? true : false);
  }

  signUp(id: string, email: string, password: string, nickname: string) {
    return this.#apiRequest({
      method: HTTP_METHOD.POST,
      url: 'account/signup',
      accessTokenRequired: false,
      additionalHeaders: {}, data: { id: id, pw: password, nick: nickname, email: email }
    }).then((apiResult) => {
      if (apiResult.success) {
        if (apiResult.subCode === 'user.sign_up_but_need_email_verification') {
          // Server responsed with success,
          // but there won't be a user info as user can sign-in after email verification.
          return this;
        }

        this.#accessToken = apiResult.data.user.access_token.token;
        this.#accessTokenExpiresAt = new Date(apiResult.data.user.access_token.exp);
        this.#refreshResult = apiResult.data;
        return this;
      }

      // We need to generate error message from the subcode.
      let errorMsg = '';
      let errorFieldName = '';
      switch (apiResult.subCode) {
        case 'user.already_used': {
          const duplicatedItems: string = apiResult.data.duplicate[0];
          let duplicatedItemsKor = '';
          switch (duplicatedItems) {
            case 'email':
              errorFieldName = 'email';
              duplicatedItemsKor = '이메일은';
              break;
            case 'id':
              errorFieldName = 'id';
              duplicatedItemsKor = '아이디는';
              break;
            case 'nick':
            case 'nickname':
              errorFieldName = 'nick';
              duplicatedItemsKor = '별명은';
              break;
            case 'pw':
            case 'password':
              // WTF??? HOW??????
              errorFieldName = 'pw';
              duplicatedItemsKor = '비밀번호는';
              break;
            default:
              duplicatedItemsKor = '정보는';
              break;
          }
          errorMsg = `입력하신 ${duplicatedItemsKor} 이미 다른 계정에서 사용 중이에요.`;
          break;
        }
        case 'request.body.bad_semantics': {
          // errorMsg = '입력하신 정보로 회원가입을 하실 수 없어요.\n';
          const badSemanticsReason: Record<string, unknown> = apiResult.data.bad_semantics[0];
          if (Object.prototype.hasOwnProperty.call(badSemanticsReason, 'email')) {
            errorFieldName = 'email';
            errorMsg = '올바른 이메일 형식이 아니에요.';
          } else if (Object.prototype.hasOwnProperty.call(badSemanticsReason, 'pw')) {
            const pwBadSemanticsReason: string = badSemanticsReason.pw;
            switch (pwBadSemanticsReason) {
              case 'TOO_SHORT':
                errorMsg = '비밀번호가 너무 짧아요,\n'; break;
              case 'TOO_LONG':
                errorMsg = '1024자가 넘으면 비밀번호로 쓰기에 너무 길지 않을까요?\n'; break;
              case 'NEED_MORE_CHAR_TYPE':
                errorMsg = '비밀번호가 너무 단순해요,\n'; break;
              case 'FORBIDDEN_CHAR':
                errorMsg = '비밀번호에 쉽게 입력할 수 없는 문자가 들어있어요,\n'; break;
              case 'PW_REUSED_ON_ID_EMAIL_NICK':
                errorMsg = '비밀번호가 이메일, 별칭, 또는 아이디와 같아요,\n'; break;
              default:
                errorMsg = '사용할 수 있는 비밀번호가 아니에요,\n'; break;
            }
            errorFieldName = 'pw';
            // errorMsg += '비밀번호는 영문 대소문자/숫자/특수문자 중 2가지를 혼용해서 최소 9자로 입력해주세요.';
          } else if (Object.prototype.hasOwnProperty.call(badSemanticsReason, 'id')) {
            const idBadSemanticsReason: string = badSemanticsReason.id;
            switch (idBadSemanticsReason) {
              case 'TOO_SHORT':
                errorMsg = '아이디가 너무 짧아요,\n'; break;
              case 'TOO_LONG':
                errorMsg = '아이디가 너무 길어요,\n'; break;
              case 'FORBIDDEN_CHAR':
                errorMsg = '아이디에 사용할 수 없는 문자가 들어있어요,\n'; break;
              default:
                errorMsg = '사용할 수 있는 아이디가 아니에요,\n'; break;
            }
            errorFieldName = 'id';
            errorMsg += '아이디는 4 ~ 47자 사이의 길이로 입력해주세요.';
          } else {
            errorMsg += '정보가 올바르지 않아요,\n새로고침 후 다시 시도해주세요.';
          }
          break;
        }
        default:
          errorMsg = '알 수 없는 오류가 발생했어요,\n10분 후에 다시 시도해주세요.';
      }

      throw new FrostError(
        errorMsg,
        `account/signup=>response.success=false\ncode = ${apiResult.code}\nsubCode=${apiResult.subCode}`,
        apiResult.code, true, apiResult, errorFieldName, 'account/signup');
    }).catch((reason) => {
      // as reason might be a 'FrostError',
      // we can just reset auth data and throw it directly.
      this.#clearAuthenticationInfo();
      throw reason;
    });
  }

  signIn(idOrEmail: string, password: string) {
    return this.#apiRequest({
      method: HTTP_METHOD.POST,
      url: 'account/signin',
      accessTokenRequired: false,
      additionalHeaders: {}, data: { id: idOrEmail, pw: password },
    }).then((apiResult: APIResult) => {
      if (apiResult.success) {
        this.#accessToken = apiResult.data.user.access_token.token;
        this.#accessTokenExpiresAt = new Date(apiResult.data.user.access_token.exp);
        this.#refreshResult = apiResult.data;
        this.userData
        return this;
      }

      let errorMsg = '';
      let errorFieldName = '';
      if (!apiResult)
        throw new FrostError(
          '알 수 없는 오류가 발생했어요,\n10분 후에 다시 시도해주세요.',
          `account/signin=>!apiResult`, -1, true, undefined, undefined, 'account/signin');

      // If apiResponse is in FrostError obj, We can generate error message from the subcode.
      switch (apiResult.subCode) {
        case 'user.not_found':
          errorMsg = '계정을 찾지 못했어요,\n아이디나 이메일을 다시 확인해주세요.';
          break;
        case 'user.wrong_password':
          errorFieldName = 'pw'
          errorMsg = '비밀번호가 맞지 않아요.\n';
          errorMsg += `(${apiResult.data.left_chance}번을 더 틀리시면 계정이 잠겨요.)`;
          break;
        case 'user.locked':
          errorMsg = '계정이 잠겼습니다, 관리자에게 연락해주세요.\n';
          errorMsg += `(잠긴 이유: ${apiResult.data.reason})`;
          break;
        case 'user.deactivated':
          errorMsg = '계정이 비활성화되었습니다, 관리자에게 연락해주세요.\n'
          errorMsg += `(비활성화된 이유: ${apiResult.data.reason})`;
          break;
        case 'user.email_not_verified':
          errorMsg = '아직 가입 시 적으신 메일 주소를 인증하지 않으셨어요,\n메일함을 확인 후 메일 인증을 진행해주세요.';
          break;
        default:
          errorMsg = '알 수 없는 오류가 발생했어요,\n10분 후 새로고침을 한 후에 다시 시도해주세요.';
      }

      throw new FrostError(
        errorMsg,
        `account/signin=>response.success=false\ncode = ${apiResult.code}\nsubCode=${apiResult.subCode}`,
        apiResult.code, true, apiResult, errorFieldName, 'account/signin');
    }).catch((reason) => {
      // as reason might be a 'FrostError',
      // we can just reset auth data and throw it directly.
      this.#clearAuthenticationInfo();
      throw reason;
    });
  }

  signOut() {
    return this.#apiRequest({
      method: HTTP_METHOD.POST,
      url: 'account/signout',
      accessTokenRequired: false,
      additionalHeaders: {}, data: { signout: 'OK' },
    }).then(
      () => {
        // Actually, this action won't fail, except when the server is dead.
        // Just reset the csrf token and access token.
        this.#clearAuthenticationInfo();
        return this;
      });
  }

  refreshAuthentications(forceRefresh = false) {
    if (!forceRefresh && this.#accessToken && this.#accessTokenExpiresAt > new Date()) {
      return Promise.resolve(this);
    }

    return this.#apiRequest({
      method: HTTP_METHOD.POST,
      url: 'account/refresh',
      accessTokenRequired: false
    }
    ).then((apiResult) => {
      if (apiResult.success) {
        this.#accessToken = apiResult.data.user.access_token.token;
        this.#accessTokenExpiresAt = new Date(apiResult.data.user.access_token.exp);
        this.#refreshResult = apiResult.data;
        return this;
      }
      throw new FrostError(
        '인증 정보 갱신에 실패했어요,\n다시 로그인해주세요.',
        `account/refresh=>response.success = false입니다. code = ${apiResult.code}`,
        400, true, apiResult, undefined, 'account/refresh');
    }).catch((reason) => {
      // as reason might be a 'FrostError',
      // we can just reset auth data and throw it directly.
      this.#clearAuthenticationInfo();
      throw reason;
    });
  }

  changePassword(currentPw: string, newPw: string, newPwReType: string) {
    return this.#apiRequest({
      method: HTTP_METHOD.POST,
      url: 'account/change-password',
      accessTokenRequired: false,
      additionalHeaders: {},
      data: {
        original_password: currentPw,
        new_password: newPw,
        new_password_check: newPwReType,
      },
    }).then((apiResult: APIResult) => {
      if (apiResult.success) {
        return this;
      }

      let errorMsg = '';
      let errorFieldName = '';
      if (!apiResult)
        throw new FrostError(
          '알 수 없는 오류가 발생했어요,\n10분 후에 다시 시도해주세요.',
          `account/change-password=>!apiResult`, -1, true, undefined, undefined,
          'account/change-password');

      // If apiResponse is in FrostError obj, We can generate error message from the subcode.
      switch (apiResult.subCode) {
        case 'user.not_found':
          errorMsg = '계정을 찾지 못했어요,\n아이디나 이메일을 다시 확인해주세요.';
          break;
        case 'user.wrong_password':
          errorFieldName = 'currentPw';
          errorMsg = '현재 사용 중인 비밀번호가 맞지 않아요,\n다시 시도해주세요.';
          break;
        case 'password.change_failed': {
          // apiResult.data.reason can be...
          // RETYPE_MISMATCH, TOO_SHORT, TOO_LONG, NEED_MORE_CHAR_TYPE, FORBIDDEN_CHAR
          const reasonType: string = apiResult.data.reason;
          switch (reasonType) {
            case 'RETYPE_MISMATCH':
              errorFieldName = 'newPwReType';
              errorMsg = '위에 입력하신 새 비밀번호와 일치하지 않아요,\n새 비밀번호를 다시 입력해주세요.\n';
              break;
            case 'TOO_SHORT':
              errorFieldName = 'newPw';
              errorMsg = '비밀번호가 너무 짧아요,\n';
              break;
            case 'TOO_LONG':
              errorFieldName = 'newPw';
              errorMsg = '1024자가 넘으면 비밀번호로 쓰기에 너무 길지 않을까요?\n';
              break;
            case 'NEED_MORE_CHAR_TYPE':
              errorFieldName = 'newPw';
              errorMsg = '비밀번호가 너무 단순해요,\n';
              break;
            case 'FORBIDDEN_CHAR':
              errorFieldName = 'newPw';
              errorMsg = '비밀번호에 쉽게 입력할 수 없는 문자가 들어있어요,\n';
              break;
            case 'PW_REUSED_ON_ID_EMAIL_NICK':
              errorFieldName = 'newPw';
              errorMsg = '비밀번호가 이메일, 별칭, 또는 아이디와 같아요,\n';
              break;
            default:
              errorFieldName = 'newPw';
              errorMsg = '사용할 수 있는 비밀번호가 아니에요,\n';
              break;
          }
          break;
        }

        default:
          errorMsg = '알 수 없는 오류가 발생했어요,\n10분 후에 다시 시도해주세요.';
          break;
      }

      throw new FrostError(
        errorMsg,
        'account/change-password=>\n'
        + 'response.success=false\n'
        + `code = ${apiResult.code}\n`
        + `subCode=${apiResult.subCode}`,
        apiResult.code, true, apiResult, errorFieldName,
        'account/change-password');
    }).catch((reason) => {
      if (typeof (reason) === 'object' && reason.constructor.name === 'FrostError') {
        throw reason;
      } else {
        throw new FrostError(
          '알 수 없는 오류가 발생했어요,\n10분 후에 다시 시도해주세요.',
          `account/change-password=>${reason}`, -1, true, undefined, undefined,
          'account/change-password');
      }
    });
  }

  deactivate(email: string, pw: string) {
    return this.#apiRequest({
      method: HTTP_METHOD.POST,
      url: 'account/deactivate',
      accessTokenRequired: false,
      additionalHeaders: {}, data: { email: email, password: pw, },
    }).then((apiResult: APIResult) => {
      if (apiResult.success) {
        // User will be signed out if account deactivation succeed.
        this.#clearAuthenticationInfo();
        return this;
      }

      let errorMsg = '';
      let errorFieldName = '';
      if (!apiResult)
        throw new FrostError(
          '알 수 없는 오류가 발생했어요,\n10분 후에 다시 시도해주세요.',
          `account/deactivate=>!apiResult`, -1, true, undefined, undefined,
          'account/deactivate');

      // If apiResponse is in FrostError obj, We can generate error message from the subcode.
      switch (apiResult.subCode) {
        case 'user.not_found':
          errorMsg = '계정을 찾지 못했어요,\n아이디나 이메일을 다시 확인해주세요.';
          break;
        case 'user.info_mismatch':
          errorMsg = '계정 정보가 다른 곳에서 변경된 것 같아요,\n새로고침 후 다시 시도해주세요.';
          break;
        case 'user.wrong_password':
          errorFieldName = 'pw';
          errorMsg = '비밀번호가 맞지 않아요,\n다시 시도해주세요.';
          break;
        case 'user.locked':
          errorMsg = '계정이 잠겨있어서 비활성화를 할 수 없습니다,\n계정을 잠근 상태에서 해제한 후 다시 시도해주세요.\n';
          errorMsg += `(계정이 잠긴 이유: ${apiResult.data.reason})`;
          break;
        case 'user.deactivated':
          errorMsg = '계정이 이미 비활성화가 되어있습니다,\n이용해주셔서 감사합니다!\n';
          errorMsg += `(계정이 비활성화된 이유: ${apiResult.data.reason})`;
          break;
        default:
          errorMsg = '알 수 없는 오류가 발생했어요,\n10분 후에 다시 시도해주세요.';
          break;
      }

      throw new FrostError(
        errorMsg,
        'account/deactivate=>\n'
        + 'response.success=false\n'
        + `code = ${apiResult.code}\n`
        + `subCode=${apiResult.subCode}`,
        apiResult.code, true, apiResult, errorFieldName,
        'account/deactivate');
    }).catch((reason) => {
      if (typeof (reason) === 'object' && reason.constructor.name === 'FrostError') {
        throw reason;
      } else {
        throw new FrostError(
          '알 수 없는 오류가 발생했어요,\n10분 후에 다시 시도해주세요.',
          `account/deactivate=>${reason}`, -1, true, undefined, undefined,
          'account/deactivate');
      }
    });
  }

  modifyAccountInfo(newAccountData: Partial<FrostAccountModifiableInfoTypes>, refreshAfterSuccess = false) {
    return this.#apiRequest({
      method: HTTP_METHOD.POST,
      url: 'account',
      accessTokenRequired: false,
      additionalHeaders: {},
      data: newAccountData,
    }).then((apiResult: APIResult) => {
      if (apiResult.success) {
        if (refreshAfterSuccess) {
          return this.refreshAuthentications(true);
        } else {
          return this;
        }
      } else {
        throw new FrostError(
          '계정의 정보를 수정하는 중 알 수 없는 문제가 발생했습니다.',
          'account/=>\n'
          + 'response.success=false\n'
          + `code = ${apiResult.code}\n`
          + `subCode=${apiResult.subCode}`,
          apiResult.code, false,
          apiResult, undefined, 'account');
      }
    }).catch((reason: FrostError) => {
      if (typeof (reason) === 'object' && reason.constructor.name === 'FrostError' && reason.apiResponse) {
        let errorMsg = '계정의 정보를 수정하는 중 알 수 없는 문제가 발생했습니다.';
        let errorFieldName = '';
        const SERVER_CLIENT_FIELD_MAP = {
          id: 'id', nickname: 'nick',
          // We won't support those two yet.
          private: '', description: '',
        }

        switch (reason.apiResponse.subCode) {
          case 'user.not_found':
            errorMsg = '사용자를 찾을 수 없습니다,\n새로고침 후 다시 시도해주세요.';
            break;
          case 'user.already_used': {
            const duplicatedItems: string = reason.apiResponse.data.duplicate[0];
            let duplicatedItemsKor = '';
            switch (duplicatedItems) {
              case 'email':
                errorFieldName = 'email';
                duplicatedItemsKor = '이메일은';
                break;
              case 'id':
                errorFieldName = 'id';
                duplicatedItemsKor = '아이디는';
                break;
              case 'nick':
              case 'nickname':
                errorFieldName = 'nick';
                duplicatedItemsKor = '별명은';
                break;
              case 'pw':
              case 'password':
                // WTF??? HOW??????
                errorFieldName = 'pw';
                duplicatedItemsKor = '비밀번호는';
                break;
              default:
                duplicatedItemsKor = '정보는';
                break;
            }
            errorMsg = `입력하신 ${duplicatedItemsKor} 이미 다른 계정에서 사용 중이에요.`;
            break;
          }
          case 'request.body.empty':
            errorMsg = '계정의 새 정보가 서버에 제대로 닿지 않았어요,\n새로고침 후 다시 시도해주세요.';
            break;
          case 'request.body.bad_semantics': {
            const badSemanticsData: {
              field: string;
              reason: string;
            }[] = reason.apiResponse.data;
            const parsedBadSemanticsData = badSemanticsData.forEach((value, index, array) => {
              const isThisTheLastItem = (array.length - 1) === index;
              // Fuck, FrostError can pass only one error field.
              // Just return a first error field.
              const currentErrorFieldName = SERVER_CLIENT_FIELD_MAP[value.field];

              if (isThisTheLastItem && !currentErrorFieldName && !errorFieldName) {
                // If all error fields are not supported and if there's no field to show error message,
                // then just show a default message.
                errorMsg = '서버에 보낸 계정의 새 정보가 올바르지 않아요,\n새로고침 후 다시 시도해주세요.';
                return;
              }
              errorFieldName = currentErrorFieldName;
              errorMsg = '허용되지 않는 문자가 포함되어 있어요,\n다시 입력해주세요.';
            });
            break;
          }
          default:
            errorMsg = '알 수 없는 문제가 발생했습니다,\n새로고침 후 다시 시도해주세요.';
            break;
        }

        throw new FrostError(
          errorMsg,
          'account/=>\n'
          + 'response.success=false\n'
          + `code = ${reason.apiResponse.code}\n`
          + `subCode=${reason.apiResponse.subCode}`,
          reason.apiResponse.code, false, reason.apiResponse, errorFieldName, 'account');
      } else {
        throw new FrostError(
          '계정의 정보를 수정하는 중 알 수 없는 문제가 발생했습니다.',
          `account=>${reason}`, -1, false, undefined, undefined, 'account');
      }
    });
  }

  get userID() {
    if (!this.#refreshResult?.user)
      // This can cause FrostError, and this is intended.
      this.refreshAuthentications();

    return this.#refreshResult.user.id;
  }

  get userData() {
    if (!this.#refreshResult?.user)
      // This can cause FrostError, and this is intended.
      this.refreshAuthentications();

    return this.#refreshResult.user;
  }

  get roles() {
    if (!this.#accessToken)
      // This can cause FrostError, and this is intended.
      this.refreshAuthentications();

    const result: Array<{ [roleName: string]: string | boolean; }> = [];
    try {
      const token = JSON.parse(atob(this.#accessToken.split('.')[1]));
      JSON.parse(token.role).forEach((rolePart: string) => {
        if (rolePart === 'admin') return;
        result.push(role2Object(rolePart));
      });
    } catch (e) {
      /* tslint:disable:no-empty */
    }

    return result;
  }

  head(url: string, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest({
      method: HTTP_METHOD.HEAD,
      url: url,
      accessTokenRequired: accessTokenRequired,
      additionalHeaders: additionalHeaders
    });
  }
  get(url: string, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest({
      method: HTTP_METHOD.GET,
      url: url,
      accessTokenRequired: accessTokenRequired,
      additionalHeaders: additionalHeaders
    });
  }
  post(url: string, data: Record<string, unknown> = {}, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest({
      method: HTTP_METHOD.POST,
      url: url,
      accessTokenRequired: accessTokenRequired,
      additionalHeaders: additionalHeaders,
      data: data
    });
  }
  put(url: string, data: Record<string, unknown> = {}, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest({
      method: HTTP_METHOD.PUT,
      url: url,
      accessTokenRequired: accessTokenRequired,
      additionalHeaders: additionalHeaders,
      data: data
    });
  }
  patch(url: string, data: Record<string, unknown> = {}, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest({
      method: HTTP_METHOD.PATCH,
      url: url,
      accessTokenRequired: accessTokenRequired,
      additionalHeaders: additionalHeaders,
      data: data
    });
  }
  delete(url: string, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest({
      method: HTTP_METHOD.DELETE,
      url: url,
      accessTokenRequired: accessTokenRequired,
      additionalHeaders: additionalHeaders
    });
  }
}

export default FrostAPI;
