import { APIErrorMessage, AccountErrorMessage } from '@network/const';
import * as NType from '@network/model';
import * as objUtil from '@util/object_util';
import * as strUtil from '@util/string_util';

const getAPIErrorDebugMessage = (
  apiResult: NType.APIResult<unknown>
) => `${apiResult.route} | ${apiResult.method} | apiResult.sub_code === ${apiResult.sub_code}`;
const createSimpleAPIErrorObj = (
  apiResult: NType.APIResult<unknown>,
  message: string,
  accessTokenInvalidation?: boolean,
  fields?: Record<string, string>,
) => new NType.APIError(
  message,
  getAPIErrorDebugMessage(apiResult),
  apiResult.code,
  accessTokenInvalidation,
  undefined,
  fields,
  apiResult.route,
);

class API {
  // Refresh Token will be saved on cookie storage, and all of these attributes must be private.
  readonly #BASE_URL = 'https://mudev.cc/api/dev/';
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
  #csrfToken = strUtil.generateRandomSecureToken(32);
  #accessToken = '';
  #accessTokenExpiresAt: Date = new Date('Thu, 01 Jan 1970 00:00:00 GMT');

  private static instance: API;
  constructor() {
    if (API.instance) return API.instance;

    this.#csrfToken = strUtil.generateRandomSecureToken(32);
    API.instance = this;
  }

  #clearAuthenticationInfo() {
    this.#accessToken = '';
    this.#accessTokenExpiresAt = new Date('Thu, 01 Jan 1970 00:00:00 GMT');
    this.#csrfToken = strUtil.generateRandomSecureToken(32);
  }

  #fetch: NType.APIRequestFetcherType = (method, route, accessTokenRequired, additionalHeaders, data) => {
    const fetchOption: RequestInit = objUtil.filterRecord({
      // deep copy fetch option object
      ...this.#DEFAULT_FETCH_OPTION,
      method: method,
      headers: objUtil.filterRecord({
        ...this.#DEFAULT_FETCH_HEADER,
        ...(additionalHeaders ?? {}),
        // always send X-Csrf-Token. This won't be a security hole.
        'X-Csrf-Token': this.#csrfToken,
        // add access token on header if accessTokenRequired is true
        'Authorization': accessTokenRequired ? `Bearer ${this.#accessToken}` : '',
      }),
      // only add body on POST/PATCH/PUT methods
      body: (method == NType.HttpMethodType.POST || method == NType.HttpMethodType.PATCH || method == NType.HttpMethodType.PUT) ? JSON.stringify(data ?? {}) : undefined,
      // only add credentials on account/admin routes
      credentials: (route.includes('account') || route.includes('admin')) ? 'include' : undefined,
    });

    // TODO: FIXME: We need to handle HEAD method separately as this method doesn't return any body.
    return fetch(this.#BASE_URL + route, fetchOption);
  };

  #checkResponse: NType.APIResponseHandlerType = async (method, route, accessTokenRequired, additionalHeaders, data, isRetry, response) => {
    const getDebugErrorMessage = () => `${route} | ${method} | response.status === ${response?.status ?? -1}`;
    const createAPIErrorObj = (message: string, debugMessage?: string, accessTokenInvalidation?: boolean) => new NType.APIError(
      message,
      debugMessage ?? getDebugErrorMessage(),
      response?.status ?? -1,
      accessTokenInvalidation ?? false,
      undefined,
      undefined,
      route,
    );

    if (!response) { // How is this possible???
      throw createAPIErrorObj(APIErrorMessage.RESPONSE_IS_NULL, 'fetchResult 객체가 undefined 또는 null입니다.');
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

      return {response: response, header: response.headers, body: await response.json() as Record<string, unknown>};
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
          if (isRetry) throw createAPIErrorObj(APIErrorMessage.TOKEN_INVALID, '인증 실패 & route !== account/refresh\n', true);

          const api = await this.refreshAuthentications(true);
          const fetchResult = await api.#fetch(method, route, accessTokenRequired, additionalHeaders, data, true);
          return api.#checkResponse(method, route, accessTokenRequired, additionalHeaders, data, true, fetchResult);
        }
        return {response: response, header: response.headers, body: await response.json() as Record<string, unknown>};
      } else if (API.RETURNABLE_ERROR.includes(response.status)) { // this "possibly" returns response.json(), See RETURNABLE_ERROR for more details.
        return {response: response, header: response.headers, body: await response.json() as Record<string, unknown>};
      } else if (response.status === 403) { // Requested action was forbidden
        throw createAPIErrorObj(APIErrorMessage.PERMISSION_DENIED);
      } else if (response.status === 404) { // Resource not found
        // 404 can be meant to be both resource not found and http not found,
        // and we need to handle those separately.
        const responseBody = await response.json() as Record<string, unknown>;
        if (responseBody['sub_code'] && responseBody['sub_code'] !== 'resource.not_found')
          throw createAPIErrorObj(APIErrorMessage.API_NOT_FOUND);
        return {response: response, header: response.headers, body: responseBody};
      } else if (response.status === 405) { // Method not permitted
        throw createAPIErrorObj(APIErrorMessage.WRONG_REQUEST);
      } else if (response.status === 415) { // requested response content-type not supported
        throw createAPIErrorObj(APIErrorMessage.WRONG_REQUEST);
      } else if (response.status === 429) {
        throw createAPIErrorObj(APIErrorMessage.REQUEST_TOO_FREQUENT, `429 rate limit`);
      } else { // unknown client-fault error
        throw createAPIErrorObj(APIErrorMessage.DEFAULT_API_ERROR);
      }
    } else {  // HTTP status code is more than 500(server error)
      throw createAPIErrorObj(APIErrorMessage.DEFAULT_SERVER_ERROR);
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
    const fetchCheckResult: NType.APIResponseType = await this.#checkResponse(method, route, accessTokenRequired, additionalHeaders, data, isRetry, fetchResult);
    return new NType.APIResult(route, method, fetchCheckResult);
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

    const apiResult = await this.post<NType.AuthenticationResponseDataType>('account/refresh').catch((reason: NType.APIError) => {
      this.#clearAuthenticationInfo();
      throw reason;
    });
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

  head<T>(route: string, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.HEAD, route, accessTokenRequired, additionalHeaders);
  }
  get<T>(route: string, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.GET, route, accessTokenRequired, additionalHeaders);
  }
  post<T>(route: string, data: Record<string, unknown> = {}, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.POST, route, accessTokenRequired, additionalHeaders, data, false);
  }
  put<T>(route: string, data: Record<string, unknown> = {}, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.PUT, route, accessTokenRequired, additionalHeaders, data, false);
  }
  patch<T>(roue: string, data: Record<string, unknown> = {}, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.PATCH, roue, accessTokenRequired, additionalHeaders, data, false);
  }
  delete<T>(route: string, accessTokenRequired = false, additionalHeaders = {}) {
    return this.#apiRequest<T>(NType.HttpMethodType.DELETE, route, accessTokenRequired, additionalHeaders, undefined, false);
  }

  signIn = async (id: string, pw: string) => {
    try {
      const apiResult = await this.post<NType.AuthenticationResponseDataType>('account/signin', { id, pw });
      if (apiResult.success) {
        this.#accessToken = apiResult.data.user.access_token.token;
        this.#accessTokenExpiresAt = new Date(apiResult.data.user.access_token.exp);
        return this;
      }
      this.#clearAuthenticationInfo();

      const getAPIErrorObj = (message: string, fields?: Record<string, string>) => createSimpleAPIErrorObj(apiResult, message, true, fields);
      switch (apiResult.sub_code) {
        case 'user.not_found':
          throw getAPIErrorObj(AccountErrorMessage.NOT_FOUND);
        case 'user.wrong_password': {
          const message = strUtil._f(AccountErrorMessage.WRONG_PASSWORD_WITH_WARNING, apiResult.data.left_chance)
          throw getAPIErrorObj(message, {pw: message});
        }
        case 'user.locked':
          throw getAPIErrorObj(strUtil._f(AccountErrorMessage.LOCKED, apiResult.data.reason));
        case 'user.deactivated':
          throw getAPIErrorObj(strUtil._f(AccountErrorMessage.DEACTIVATED, apiResult.data.reason));
        case 'user.email_not_verified':
          throw getAPIErrorObj(AccountErrorMessage.EMAIL_NOT_VERIFIED);
        default:
          throw getAPIErrorObj(APIErrorMessage.DEFAULT_API_ERROR);
      }
    } catch (e) {
      this.#clearAuthenticationInfo();
      throw e;
    }
  };

  signUp = async (id: string, email: string, pw: string, nick: string) => {
    const apiResult = await this.post<NType.AuthenticationResponseDataType>('account/signup', { id, pw, nick, email });
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

    const getAPIErrorObj = (message: string, fields?: Record<string, string>) => createSimpleAPIErrorObj(apiResult, message, true, fields);
    switch (apiResult.sub_code) {
      case 'user.already_used': {
        const duplicatedItem: string = apiResult.data.duplicate[0];
        const message = strUtil._f(AccountErrorMessage.FIELD_VALUE_ALREADY_USED, strUtil.getAlreadyUsedFieldName(duplicatedItem));
        throw getAPIErrorObj(message, duplicatedItem);
      }
      case 'request.body.bad_semantics': {
        const badSemanticsReason: Record<string, unknown> = apiResult.data.bad_semantics[0];
        if (Object.prototype.hasOwnProperty.call(badSemanticsReason, 'email')) {
          const message = AccountErrorMessage.EMAIL_NOT_VALID;
          throw getAPIErrorObj(message, {email: message});
        } else if (Object.prototype.hasOwnProperty.call(badSemanticsReason, 'pw')) {
          const reason = strUtil.getPasswordFailureReason(badSemanticsReason.pw);
          const message = strUtil._f(AccountErrorMessage.PASSWORD_NOT_VALID, reason);
          throw getAPIErrorObj(message, {pw: message});
        } else if (Object.prototype.hasOwnProperty.call(badSemanticsReason, 'id')) {
          const reason = strUtil.getIDFailureReason(badSemanticsReason.id);
          const message = strUtil._f(AccountErrorMessage.ID_NOT_VALID, reason);
          throw getAPIErrorObj(message, {id: message});
        } else { throw getAPIErrorObj(AccountErrorMessage.FIELD_NOT_VALID); }
      }
      default: throw getAPIErrorObj(APIErrorMessage.DEFAULT_API_ERROR);
    }
  };

  signOut: () => Promise<API> = async () => {
    await this.post('account/signout', { signout: 'OK' });
    // Actually, this action won't fail, except when the server is dead.
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

    const getAPIErrorObj = (message: string, fields?: Record<string, string>) => createSimpleAPIErrorObj(apiResult, message, true, fields);
    switch (apiResult.sub_code) {
      case 'user.not_found':
        throw getAPIErrorObj(AccountErrorMessage.NOT_FOUND);
      case 'user.info_mismatch':
        throw getAPIErrorObj(AccountErrorMessage.INFO_MISMATCH);
      case 'user.wrong_password': {
        const message = AccountErrorMessage.WRONG_PASSWORD;
        throw getAPIErrorObj(message, {pw: message});
      }
      case 'user.locked':
        throw getAPIErrorObj(strUtil._f(AccountErrorMessage.DEACTIVATE_FAIL_AS_ACCOUNT_LOCKED, apiResult.data.reason));
      case 'user.deactivated':
        throw getAPIErrorObj(strUtil._f(AccountErrorMessage.DEACTIVATE_FAIL_AS_ALREADY_DEACTIVATED, apiResult.data.reason));
      default:
        throw getAPIErrorObj(APIErrorMessage.DEFAULT_API_ERROR);
    }
  };

  changePassword = async (original_password: string, new_password: string, new_password_check: string) => {
    const apiResult = await this.post('account/change-password', {original_password, new_password, new_password_check});
    if (apiResult.success) return this;

    const getAPIErrorObj = (message: string, fields?: Record<string, string>) => createSimpleAPIErrorObj(apiResult, message, true, fields);
    switch (apiResult.sub_code) {
      case 'user.not_found':
        throw getAPIErrorObj(AccountErrorMessage.NOT_FOUND);
      case 'user.wrong_password': {
        const message = AccountErrorMessage.WRONG_CURRENT_PASSWORD
        throw getAPIErrorObj(message, {original_password: message});}
      case 'password.change_failed': {
        const reasonType: string = apiResult.data.reason.toLowerCase();
        const reason = strUtil.getPasswordFailureReason(reasonType);
        const message = strUtil._f(AccountErrorMessage.PASSWORD_NOT_VALID, reason);
        const field = reasonType === 'retype_mismatch' ? 'new_password_check' : 'new_password';
        throw getAPIErrorObj(message, {[field]: message});
      }
      default:
        throw getAPIErrorObj(APIErrorMessage.DEFAULT_API_ERROR);
    }
  };

  modifyAccountInfo = async (newAccountData: Partial<NType.AccountInfoModifyRequestType>, refreshAfterSuccess = false) => {
    const apiResult = await this.post<NType.AuthenticationResponseDataType>('account', newAccountData);
    if (apiResult.success) return refreshAfterSuccess ? this.refreshAuthentications(true) : this;

    const getAPIErrorObj = (message: string, fields?: Record<string, string>) => createSimpleAPIErrorObj(apiResult, message, true, fields);
    switch (apiResult.sub_code) {
      case 'user.not_found':
        throw getAPIErrorObj(AccountErrorMessage.NOT_FOUND);
      case 'user.info_mismatch':
        throw getAPIErrorObj(AccountErrorMessage.INFO_MISMATCH);
      case 'user.already_used': {
        const duplicatedItem: string = apiResult.data.duplicate[0];
        const message = strUtil._f(AccountErrorMessage.FIELD_VALUE_ALREADY_USED, strUtil.getAlreadyUsedFieldName(duplicatedItem));
        throw getAPIErrorObj(message, duplicatedItem);
      }
      case 'request.body.empty':
        throw getAPIErrorObj(APIErrorMessage.REQUEST_BODY_EMPTY);
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
          throw getAPIErrorObj(APIErrorMessage.REQUEST_BODY_CONTAINS_INVALID_CHAR)
        });
        break;
      }
      default:
        throw getAPIErrorObj(APIErrorMessage.DEFAULT_API_ERROR);
    }
  };
}

export default API;
