import { DetailedAPIErrorMessageType, getAPIErrorMessage } from '@network/const';

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

export type APIRequestCallableArgumentType = [
  method: HttpMethodType,
  route: string,
  accessTokenRequired: boolean,
  additionalHeaders?: Record<string, string>,
  data?: Record<string, unknown>,
  isRetry?: boolean,
  response?: Response,
];
export type APIResponseType = {
  response: Response,
  header: Headers,
  body?: Partial<APIResult>,
};
export type APIRequestCallableType = <T,>(...args: APIRequestCallableArgumentType) => Promise<APIResult<T>>;
export type APIRequestFetcherType = (...args: APIRequestCallableArgumentType) => Promise<Response>;
export type APIResponseHandlerType = (...args: APIRequestCallableArgumentType) => Promise<APIResponseType>;

export type AccountModifiableInfoType = {
  id: string;
  nickname: string;
  private: boolean;
  description: string;
}

export class APIResult<ResponseBodyType = object | undefined> {
  route: string;
  method: HttpMethodType;
  success = false;
  code = -1;
  sub_code = '';
  message = '';
  header?: Headers;
  data: ResponseBodyType;

  constructor(route: string, method: HttpMethodType, response: APIResponseType) {
    this.route = route;
    this.method = method;
    this.success = response.body?.success ?? false;
    this.code = response.response.status;
    this.sub_code = response.body?.sub_code ?? '';
    this.message = response?.body?.message ?? '';
    this.data = response?.body?.data as ResponseBodyType;
    this.header = response.header;

    if (!this.success) {
      const apiErrorMsg: DetailedAPIErrorMessageType | undefined = getAPIErrorMessage(this.sub_code);
      if (apiErrorMsg)
        throw new APIError(apiErrorMsg.message, apiErrorMsg.debugMessage, this.code)

      return this;
    }
  }
}

export class APIError extends Error {
  message: string;
  debugMessage: string;
  date: Date;
  httpRespCode = -1;
  accessTokenInvalidation = false;
  apiResponse?: APIResult | null;
  fields?: Record<string, string>;
  route?: string;

  constructor(
    message: string,
    debugMessage: string,
    httpRespCode: number,
    accessTokenInvalidation = false,
    apiResponse?: APIResult,
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

export type AccountInfoModifyRequestType = {
  id: string;
  nick: string;
  private: boolean;
  description: string;
}

export type AuthenticationResponseDataType = {
  user: {
    access_token: {
      token: string;
      exp: number;
    };
    refresh_token: {
      exp: number;
    };
  };
};


export type FailedResponseDataType = {
  reason?: string;
  bad_semantics?: {
    field: string;
    reason: string;
  };
  left_chance?: number;
}
