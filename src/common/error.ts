// (c) MUsoftware 2022
'use strict';

import { APIResult } from "../network/api_response";

export class FrostError extends Error {
  message: string;
  debugMessage: string;
  date: Date;
  httpRespCode: number = -1;
  accessTokenInvalidation: boolean = false;
  route?: string;
  apiResponse?: APIResult | null;
  fieldName?: string;

  constructor(
    message: string,
    debugMessage: string,
    httpRespCode: number,
    accessTokenInvalidation = false,
    apiResponse?: APIResult,
    fieldName?: string,
    route = '',
    ...params: any[]) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FrostError);
    }

    // Custom debugging information
    this.message = message
    this.debugMessage = debugMessage;
    this.httpRespCode = httpRespCode;
    this.accessTokenInvalidation = accessTokenInvalidation;
    this.route = route;
    this.apiResponse = apiResponse;
    this.fieldName = fieldName;
    this.date = new Date();
  }
}
