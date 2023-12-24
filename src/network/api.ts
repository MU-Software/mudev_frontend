import { APIErrorMessage, AccountErrorMessage } from '@local/network/const';
import * as NType from '@local/network/model';
import * as objUtil from '@local/util/object_util';
import * as strUtil from '@local/util/string_util';

const getAPIErrorDbgMsg = (
  apiResult: NType.APIResultType
) => `[${apiResult.method}] ${apiResult.route} | apiResult.sub_code === ${apiResult.sub_code}`;

const getAPIErrObj = (
  msg: string,
  dbgMsg?: string,
  apiResult?: NType.APIResultType,
  accessTokenInvalidation = false,
  fields?: Record<string, string>,
) => new NType.APIError(
  msg,
  dbgMsg ?? (apiResult ? getAPIErrorDbgMsg(apiResult) : 'apiResult 객체가 undefined 또는 null입니다.'),
  apiResult?.code ?? -1,
  accessTokenInvalidation,
  apiResult,
  fields,
)

// const createAPIErrorObj = (
//   apiResult: NType.APIResultType,
//   message: string,
//   accessTokenInvalidation?: boolean,
//   fields?: Record<string, string>,
// ) => new NType.APIError(
//   message,
//   getAPIErrorDbgMsg(apiResult),
//   apiResult.code,
//   accessTokenInvalidation,
//   undefined,
//   fields,
//   apiResult.route,
// );

// const apiErrorWithTokenInvalidation = (apiRes: NType.APIResultType, msg: string, fields?: Record<string, string>) => createAPIErrorObj(apiRes, msg, true, fields);

class API {
  // We "possibly" returns response.json() on these HTTP Response status code.
  // Although these HTTP Response status code means error, each routes have to handle these codes differently.
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
  // Default fetch headers and options,
  // we'll copy and modify this default header and option object on every request.
  readonly #DEFAULT_FETCH_HEADER: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  readonly #DEFAULT_FETCH_OPTION: RequestInit = {
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'strict-origin-when-cross-origin',
  };

  // Account related properties
  #accessToken = '';
  #accessTokenExpiresAt: Date = new Date('Thu, 01 Jan 1970 00:00:00 GMT');

  private static instance: API;
  constructor() {
    if (API.instance) return API.instance;

    API.instance = this;
  }

  #clearAuthenticationInfo() {
    this.#accessToken = '';
    this.#accessTokenExpiresAt = new Date('Thu, 01 Jan 1970 00:00:00 GMT');
  }

  #fetch: NType.APIRequestFetcherType = (method, route, accessTokenRequired, additionalHeaders, data) => {
    const fetchOption: RequestInit = objUtil.filterRecord({
      // deep copy fetch option object
      ...this.#DEFAULT_FETCH_OPTION,
      method: method,
      headers: objUtil.filterRecord({
        ...this.#DEFAULT_FETCH_HEADER,
        ...(additionalHeaders ?? {}),
        // Add access token on header if accessTokenRequired is true
        'Authorization': accessTokenRequired ? `Bearer ${this.#accessToken}` : '',
      }),
      // only add body on POST/PATCH/PUT methods
      body: (method == NType.HttpMethodType.POST || method == NType.HttpMethodType.PATCH || method == NType.HttpMethodType.PUT) ? JSON.stringify(data ?? {}) : undefined,
      // only add credentials on account/admin routes
      credentials: (route.includes('account') || route.includes('admin')) ? 'include' : undefined,
    });

    // TODO: FIXME: We need to handle HEAD method separately as this method doesn't return any body.
    return fetch(import.meta.env.VITE_API_SERVER + route, fetchOption);
  };

  #checkResponse: NType.APIResponseHandlerType = async (method, route, accessTokenRequired, additionalHeaders, data, isRetry, response) => {
    if (!response) { // How is this possible???
      throw getAPIErrObj(APIErrorMessage.RESPONSE_IS_NULL, 'fetchResult 객체가 undefined 또는 null입니다.');
    } else if (200 <= response.status && response.status <= 399) {  // SUCCESS // this returns response.json()
      if (response.status === 204) { // resource.deleted
        // As 204 response means that resource is deleted and response does not include a response body,
        // we need to make and return a fake response object.
        return {
          response: response,
          header: response.headers,
          body: {
            success: true,
            code: 204,
            sub_code: 'resource.deleted',
            message: 'Resource successfully deleted',
          },
        };
      }

      return { response: response, header: response.headers, body: await response.json() as Record<string, unknown> };
    } else if (400 <= response.status && response.status <= 499) {
      if (response.status === 401) {  // this "possibly" returns response.json()
        /*
          This code can be returned on both resource and account related routes,
          and we need to handle those separately.

          Possible subCodes:
          > wrong password / account locked / account deactivated (== maybe one of account related routes?)
            - These will be raised when we signing in.
              We need to throw a proper APIError.
          > token not given / token expired / token invalid
            - We need to try refreshing access token and retry this.
              If access token refresh fails, then raise errors.

          If the error-occurred-request is related to resource routes,
          then we'll refresh access token and and retry the request.
          and if it fails, then we'll throw APIError.

          If the error-occurred-request is related to account routes,
          then we need to parse subCode, so we'll handle this error on second stage.
        */
        if (!route.startsWith('account/')) {
          if (isRetry) throw getAPIErrObj(APIErrorMessage.TOKEN_INVALID, '인증 실패 & route !== account/refresh\n', undefined, true);

          const api = await this.refreshAuthentications(true);
          const fetchResult = await api.#fetch(method, route, accessTokenRequired, additionalHeaders, data, true);
          return api.#checkResponse(method, route, accessTokenRequired, additionalHeaders, data, true, fetchResult);
        }
        return { response: response, header: response.headers, body: await response.json() as Record<string, unknown> };
      } else if (API.RETURNABLE_ERROR.includes(response.status)) { // this "possibly" returns response.json(), See RETURNABLE_ERROR for more details.
        return { response: response, header: response.headers, body: await response.json() as Record<string, unknown> };
      } else if (response.status === 403) { // Requested action was forbidden
        throw getAPIErrObj(APIErrorMessage.PERMISSION_DENIED);
      } else if (response.status === 404) { // Resource not found
        // 404 can be meant to be both resource not found and http not found,
        // and we need to handle those separately.
        const responseBody = await response.json() as Record<string, unknown>;
        if (responseBody['sub_code'] && responseBody['sub_code'] !== 'resource.not_found')
          throw getAPIErrObj(APIErrorMessage.API_NOT_FOUND);
        return { response: response, header: response.headers, body: responseBody };
      } else if (response.status === 405) { // Method not permitted
        throw getAPIErrObj(APIErrorMessage.WRONG_REQUEST);
      } else if (response.status === 415) { // requested response content-type not supported
        throw getAPIErrObj(APIErrorMessage.WRONG_REQUEST);
      } else if (response.status === 429) {
        throw getAPIErrObj(APIErrorMessage.REQUEST_TOO_FREQUENT, `429 rate limit`);
      } else { // unknown client-fault error
        throw getAPIErrObj(APIErrorMessage.DEFAULT_API_ERROR);
      }
    } else {  // HTTP status code is more than 500(server error)
      throw getAPIErrObj(APIErrorMessage.DEFAULT_SERVER_ERROR);
    }
  };

  #apiRequest: NType.APIRequestCallableType = async (method, route, accessTokenRequired, additionalHeaders, data, isRetry) => {
    // check if requested method is allowed
    if (NType.HttpMethod.indexOf(method) == -1)
      throw new NType.APIError(APIErrorMessage.DEFAULT_API_ERROR, `Requested method is not allowed: ${method}`, -1, false, undefined, undefined, route);

    const fetchResult: Response = await this.#fetch(method, route, accessTokenRequired, additionalHeaders, data, isRetry).catch((reason: Error) => {
      // catch all exceptions and change it to APIError
      const debugMsg = (
        `on API.#apiRequest -> reason/message = ${reason.message ?? undefined}\n`
        + `on API.#apiRequest -> stack = ${reason.stack ?? 'undefined'}\n`
      )
      throw new NType.APIError(APIErrorMessage.DEFAULT_API_ERROR, debugMsg, -1, false, undefined, undefined, route);
    });
    const fetchCheckResult = await this.#checkResponse(method, route, accessTokenRequired, additionalHeaders, data, isRetry, fetchResult);
    return NType.toAPIResult(route, method, true, fetchCheckResult);
  }

  isSignedIn = async (checkNetwork?: boolean) => {
    if (!checkNetwork) return Promise.resolve(this.#accessToken ? true : false);

    try {
      return await this.refreshAuthentications() ? true : false;
    } catch (e) {
      return false;
    }
  }

  refreshAuthentications = async (useNetwork = false) => {
    if (!useNetwork && this.#accessToken && this.#accessTokenExpiresAt > new Date()) return Promise.resolve(this);

    const apiResult = await this.post<NType.TokenRefreshRespDataType>('account/refresh').catch(
      (reason: NType.APIError) => { this.#clearAuthenticationInfo(); throw reason; }
    );
    if (apiResult.success && apiResult.data) {
      this.#accessToken = apiResult.data.user.access_token.token;
      this.#accessTokenExpiresAt = new Date(apiResult.data.user.access_token.exp);
      return this;
    }

    this.#clearAuthenticationInfo();
    throw new NType.APIError(
      APIErrorMessage.TOKEN_INVALID,
      `account/refresh | POST | response.success = false, response.status = ${apiResult.code}`,
      400, true, apiResult, undefined, 'account/refresh',
    );
  }

  head<T extends NType.APIResultGenericTypes>(route: string, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.HEAD, route, accessTokenRequired, additionalHeaders);
  }
  get<T extends NType.APIResultGenericTypes = NType.APIResultGenericTypes>(route: string, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.GET, route, accessTokenRequired, additionalHeaders);
  }
  post<T extends NType.APIResultGenericTypes = NType.APIResultGenericTypes>(route: string, data: Record<string, unknown> = {}, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.POST, route, accessTokenRequired, additionalHeaders, data, false);
  }
  put<T extends NType.APIResultGenericTypes = NType.APIResultGenericTypes>(route: string, data: Record<string, unknown> = {}, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.PUT, route, accessTokenRequired, additionalHeaders, data, false);
  }
  patch<T extends NType.APIResultGenericTypes = NType.APIResultGenericTypes>(roue: string, data: Record<string, unknown> = {}, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.PATCH, roue, accessTokenRequired, additionalHeaders, data, false);
  }
  delete<T extends NType.APIResultGenericTypes>(route: string, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.DELETE, route, accessTokenRequired, additionalHeaders, undefined, false);
  }

  signIn = async (id: string, pw: string) => {
    try {
      const apiResult = await this.post<NType.SignInRespDataType>('account/signin', { id, pw });
      if (apiResult.success) {
        this.#accessToken = apiResult.data.user.access_token.token;
        this.#accessTokenExpiresAt = new Date(apiResult.data.user.access_token.exp);
        return this;
      }
      this.#clearAuthenticationInfo();

      switch (apiResult.sub_code) {
        case 'user.wrong_password': {
          const leftChanceStr: string = (apiResult.data.context?.left_chance ?? 0).toString();
          const message = strUtil._f(AccountErrorMessage.WRONG_PASSWORD_WITH_WARNING, leftChanceStr);
          throw getAPIErrObj(message, undefined, apiResult, true, { pw: message });
        }
        case 'user.not_found':
          throw getAPIErrObj(AccountErrorMessage.NOT_FOUND, undefined, apiResult, true);
        case 'user.locked':
          throw getAPIErrObj(strUtil._f(AccountErrorMessage.LOCKED, apiResult.message), undefined, apiResult, true);
        case 'user.deactivated':
          throw getAPIErrObj(strUtil._f(AccountErrorMessage.DEACTIVATED, apiResult.message), undefined, apiResult, true);
        case 'user.email_not_verified':
          throw getAPIErrObj(AccountErrorMessage.EMAIL_NOT_VERIFIED, undefined, apiResult, true);
        default:
          throw getAPIErrObj(APIErrorMessage.DEFAULT_API_ERROR, undefined, apiResult, true);
      }
    } catch (e) {
      this.#clearAuthenticationInfo();
      throw e;
    }
  };

  signUp = async (id: string, email: string, pw: string, nick: string) => {
    const apiResult = await this.post<NType.SignUpRespDataType>('account/signup', { id, pw, nick, email });
    if (apiResult.success) {
      if (apiResult.sub_code === 'user.sign_up_but_need_email_verification') {
        // Server responsed with success,
        // but there won't be a user info as user can sign-in after email verification.
        this.#clearAuthenticationInfo();
        return this;
      }

      this.#accessToken = apiResult.data.user.access_token.token;
      this.#accessTokenExpiresAt = new Date(apiResult.data.user.access_token.exp);
      return this;
    }
    this.#clearAuthenticationInfo();

    switch (apiResult.sub_code) {
      // case 'user.already_used': {
      //   const duplicatedItem: string = apiResult.data.duplicate[0];
      //   const message = strUtil._f(AccountErrorMessage.FIELD_VALUE_ALREADY_USED, strUtil.getAlreadyUsedFieldName(duplicatedItem));
      //   throw apiErrorWithTokenInvalidation(apiResult, message, duplicatedItem);
      // }
      // case 'request.body.bad_semantics': {
      //   const badSemanticsReason: Record<string, unknown> = apiResult.data.bad_semantics[0];
      //   if (Object.prototype.hasOwnProperty.call(badSemanticsReason, 'email')) {
      //     const message = AccountErrorMessage.EMAIL_NOT_VALID;
      //     throw apiErrorWithTokenInvalidation(apiResult, message, { email: message });
      //   } else if (Object.prototype.hasOwnProperty.call(badSemanticsReason, 'pw')) {
      //     const reason = strUtil.getPasswordFailureReason(badSemanticsReason.pw);
      //     const message = strUtil._f(AccountErrorMessage.PASSWORD_NOT_VALID, reason);
      //     throw apiErrorWithTokenInvalidation(apiResult, message, { pw: message });
      //   } else if (Object.prototype.hasOwnProperty.call(badSemanticsReason, 'id')) {
      //     const reason = strUtil.getIDFailureReason(badSemanticsReason.id);
      //     const message = strUtil._f(AccountErrorMessage.ID_NOT_VALID, reason);
      //     throw apiErrorWithTokenInvalidation(apiResult, message, { id: message });
      //   } else { throw apiErrorWithTokenInvalidation(apiResult, AccountErrorMessage.FIELD_NOT_VALID); }
      // }
      default:
        throw getAPIErrObj(APIErrorMessage.DEFAULT_API_ERROR, undefined, apiResult, true);
    }
  };

  signOut: () => Promise<API> = async () => {
    await this.post('account/signout', { signout: 'OK' });
    // Actually, this action won't (and shouldn't) fail, except when the server is dead.
    // Just reset the csrf token and access token.
    this.#clearAuthenticationInfo();
    return this;
  };

  deactivate = async (email: string, pw: string) => {
    const apiResult = await this.post('account/deactivate', { email, pw });
    if (apiResult.success) {
      // User should be signed out if account deactivation succeed.
      this.#clearAuthenticationInfo();
      return this;
    }

    switch (apiResult.sub_code) {
      case 'user.wrong_password': {
        const message = AccountErrorMessage.WRONG_PASSWORD;
        throw getAPIErrObj(message, undefined, apiResult, true, { pw: message });
      }
      case 'user.not_found':
        throw getAPIErrObj(AccountErrorMessage.NOT_FOUND, undefined, apiResult, true);
      case 'user.info_mismatch':
        throw getAPIErrObj(AccountErrorMessage.INFO_MISMATCH, undefined, apiResult, false);
      case 'user.locked':
        throw getAPIErrObj(strUtil._f(AccountErrorMessage.LOCKED, apiResult.message), undefined, apiResult, true);
      case 'user.deactivated':
        throw getAPIErrObj(strUtil._f(AccountErrorMessage.DEACTIVATED, apiResult.message), undefined, apiResult, true);
      default:
        throw getAPIErrObj(APIErrorMessage.DEFAULT_API_ERROR, undefined, apiResult, true);
    }
  };

  changePassword = async (original_password: string, new_password: string, new_password_check: string) => {
    const apiResult = await this.post('account/change-password', { original_password, new_password, new_password_check });
    if (apiResult.success) return this;

    switch (apiResult.sub_code) {
      case 'user.wrong_password': {
        const message = AccountErrorMessage.WRONG_CURRENT_PASSWORD
        throw getAPIErrObj(message, undefined, apiResult, true, { original_password: message });
      }
      // case 'password.change_failed': {
      //   const reasonType: string = apiResult.data.reason.toLowerCase();
      //   const reason = strUtil.getPasswordFailureReason(reasonType);
      //   const message = strUtil._f(AccountErrorMessage.PASSWORD_NOT_VALID, reason);
      //   const field = reasonType === 'retype_mismatch' ? 'new_password_check' : 'new_password';
      //   throw apiErrorWithTokenInvalidation(apiResult, message, { [field]: message });
      // }
      case 'user.not_found':
        throw getAPIErrObj(AccountErrorMessage.NOT_FOUND, undefined, apiResult, true);
      default:
        throw getAPIErrObj(APIErrorMessage.DEFAULT_API_ERROR, undefined, apiResult, true);
    }
  };

  modifyAccountInfo = async (
    newAccountData: Partial<{ id: string; nick: string; private: boolean; description: string; }>,
    refreshAfterSuccess = false,
  ) => {
    const apiResult = await this.post<NType.UserInfoModifyRespDataType>('account', newAccountData);
    if (apiResult.success) return refreshAfterSuccess ? this.refreshAuthentications(true) : this;

    switch (apiResult.sub_code) {
      // case 'user.already_used': {
      //   const duplicatedItem: string = apiResult.data.duplicate[0];
      //   const message = strUtil._f(AccountErrorMessage.FIELD_VALUE_ALREADY_USED, strUtil.getAlreadyUsedFieldName(duplicatedItem));
      //   throw apiErrorWithTokenInvalidation(apiResult, message, duplicatedItem);
      // }
      // case 'request.body.bad_semantics': {
      //   const badSemanticsData: { field: string; reason: string; }[] = reason.apiResponse.data;
      //   const parsedBadSemanticsData = badSemanticsData.forEach((value, index, array) => {
      //     const isThisTheLastItem = (array.length - 1) === index;
      //     // Fuck, FrostError can pass only one error field.
      //     // Just return a first error field.
      //     const currentErrorFieldName = SERVER_CLIENT_FIELD_MAP[value.field];

      //     if (isThisTheLastItem && !currentErrorFieldName && !errorFieldName) {
      //       // If all error fields are not supported and if there's no field to show error message,
      //       // then just show a default message.
      //       errorMsg = '서버에 보낸 계정의 새 정보가 올바르지 않아요,\n새로고침 후 다시 시도해주세요.';
      //       return;
      //     }
      //     errorFieldName = currentErrorFieldName;
      //     throw apiErrorWithTokenInvalidation(apiResult, APIErrorMessage.REQUEST_BODY_CONTAINS_INVALID_CHAR)
      //   });
      //   break;
      // }
      case 'user.not_found':
        throw getAPIErrObj(AccountErrorMessage.NOT_FOUND, undefined, apiResult, true);
      case 'user.info_mismatch':
        throw getAPIErrObj(AccountErrorMessage.INFO_MISMATCH, undefined, apiResult, false);
      case 'request.body.empty':
        throw getAPIErrObj(APIErrorMessage.REQUEST_BODY_EMPTY, undefined, apiResult, false);
      default:
        throw getAPIErrObj(APIErrorMessage.DEFAULT_API_ERROR, undefined, apiResult, true);
    }
  };
}

export default API;
