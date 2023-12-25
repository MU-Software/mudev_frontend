import { DetailedAPIErrorMessageType, getAPIErrorMessage } from '@local/network/const';

export const HttpMethodType = {
  // We will support only these methods for now
  HEAD: 'HEAD',
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;
export type HttpMethodType = typeof HttpMethodType[keyof typeof HttpMethodType];
export const HttpMethod: HttpMethodType[] = Object.values(HttpMethodType);

export type PyDictType = Record<string, unknown>;
export type APIResultGenericTypes = {
  S: PyDictType;
  // Default Pydantic Validation Error Type
  Err422DT: { loc: string[]; msg: string; type: string; ctx?: PyDictType; }[];
  Err422CT: PyDictType;
};

export type APIResultErrorDataType<T extends APIResultGenericTypes = APIResultGenericTypes> = (
  // For HTTP Error Response Status
  { detail?: T['Err422DT']; context?: T['Err422CT']; } // 422
);
export type APIResultDataType<T extends APIResultGenericTypes = APIResultGenericTypes> = T['S'] | APIResultErrorDataType<T>;
export type APIResultType<T extends APIResultGenericTypes = APIResultGenericTypes> = (
  {
    route: string;
    method: HttpMethodType;
    code: number;
    sub_code: string;
    message: string;
    header?: Headers;
  } & (
    { success: true, data: T['S'] } | { success: false; data: APIResultErrorDataType<T>; }
  )
);

export const toAPIResult = <T extends APIResultGenericTypes = APIResultGenericTypes>(
  route: string,
  method: HttpMethodType,
  success = false,
  data: APIResultDataType<T>,
  code = -1,
  sub_code = '',
  message = '',
  header?: Headers,
): APIResultType<T> => {
  const newObj = { route, method, success, code, sub_code, message, header, data } as APIResultType<T>;
  if (newObj.success) return newObj;

  const apiErrorMsg: DetailedAPIErrorMessageType = getAPIErrorMessage(newObj.sub_code);
  throw new APIError(apiErrorMsg.message, apiErrorMsg.debugMessage, newObj.code, false, newObj);
};

export type APIRequestCallableArgumentType = [
  method: HttpMethodType,
  route: string,
  accessTokenRequired: boolean,
  additionalHeaders?: Record<string, string>,
  data?: PyDictType,
  isRetry?: boolean,
  response?: Response,
];
export type APIRequestFetcherType = (...args: APIRequestCallableArgumentType) => Promise<Response>;
export type APIRequestCallableType = <T extends APIResultGenericTypes = APIResultGenericTypes>(...args: APIRequestCallableArgumentType) => Promise<APIResultType<T>>;
export type APIResponseHandlerType = <T extends APIResultGenericTypes = APIResultGenericTypes>(...args: APIRequestCallableArgumentType) => Promise<{
  response: Response,
  header: Headers,
  body?: Partial<APIResultType<T>>,  // TODO: FIXME: 이거 정말 Partial로 해도 되는건가?
}>;

export class APIError<APIResponseType = [APIResultType<APIResultGenericTypes>, undefined, null]> extends Error {
  message: string;
  debugMessage: string;
  date: Date;
  httpRespCode = -1;
  accessTokenInvalidation = false;
  apiResponse?: APIResponseType;
  fields?: Record<string, string>;
  route?: string;

  constructor(
    message: string,
    debugMessage: string,
    httpRespCode: number,
    accessTokenInvalidation = false,
    apiResponse?: APIResponseType,
    fields?: Record<string, string>,
    route?: string) {
    super(message);
    this.stack = new Error().stack;

    // Custom debugging information
    this.message = message
    this.debugMessage = debugMessage;
    this.httpRespCode = httpRespCode;
    this.accessTokenInvalidation = accessTokenInvalidation;
    this.apiResponse = apiResponse;
    this.fields = fields;
    this.route = route;
    this.date = new Date();
  }
}

export type UserInfoPayloadType = {
  id: string;
  email: string;
  nickname: string;
  profile_image: string;
  description: string;
  created_at: string;
  modified_at: string;
};
export type TokenInfoPayloadType = {
  access_token: { token: string; exp: number; };
  refresh_token: { exp: number; };
};
export type AuthTSucceedRespDataType = { user: TokenInfoPayloadType; };
export type AuthTSucceedAPIResultGenericTypes = APIResultGenericTypes & { S: AuthTSucceedRespDataType; };
export type TokenRefreshRespDataType = AuthTSucceedAPIResultGenericTypes;
export type SignInRespDataType = AuthTSucceedAPIResultGenericTypes;
export type SignUpRespDataType = AuthTSucceedAPIResultGenericTypes & { Err422CT: { left_chance?: number; }; };
export type UserInfoModifyRespDataType = APIResultGenericTypes & { S: UserInfoPayloadType; };
