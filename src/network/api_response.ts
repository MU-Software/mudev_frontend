// (c) MUsoftware 2022
'use strict';

import { FrostError } from "../common/error";

export class APIResult {
  success: boolean = false;
  code: number = -1;
  subCode: string = '';
  message: string = '';
  header: Record<string, unknown> = {};
  data: Record<string, unknown> = {};

  constructor(response: { header: Record<string, unknown>, body: Record<string, unknown> }) {
    if (!response)
      throw new FrostError(
        '서버에서 받은 응답을 이해하지 못했어요,\n잠시 후에 다시 시도해주세요.',
        '서버에서 받은 데이터를 파싱하지 못했습니다.', -1);

    this.success = response.body.success ?? false;
    this.code = parseInt((response?.body?.code ?? -1), 10);
    this.subCode = response?.body?.sub_code ?? '';
    this.message = response?.body?.message ?? '';
    this.data = response?.body?.data ?? {};
    this.header = response?.header ?? {};

    if (!this.success) {
      if (this.subCode == 'request.body.invalid' || this.subCode == 'request.body.empty') {
        throw new FrostError(
          '알 수 없는 문제가 발생했어요,\n잠시 후에 다시 시도해주세요.',
          '클라이언트가 요청할 데이터를 제대로 보내지 않았어요.', this.code);
      } else if (this.subCode.startsWith('request.header')) {
        throw new FrostError(
          '알 수 없는 문제가 발생했어요,\n잠시 후에 다시 시도해주세요.',
          '클라이언트가 요청의 말머리를 제대로 보내지 않았어요.', this.code);
      } else if (this.subCode.startsWith('backend')) {
        throw new FrostError(
          '서버에 알 수 없는 문제가 발생했어요,\n잠시 후에 다시 시도해주세요.',
          '서버가 영 좋지 않은 상황이에요.', this.code);
      } else if (this.subCode.startsWith('http')) {
        throw new FrostError(
          '서버에서 무엇을 할지 모르는 요청이에요...',
          this.subCode, this.code);
      } else if (this.subCode.startsWith('refresh_token')) {
        throw new FrostError(
          '로그인 정보가 올바르지 않아요,\n죄송하지만 다시 로그인 해주세요.',
          `서버가 ${this.subCode}를 반환했습니다.`, this.code);
      } else if (this.subCode.startsWith('access_token')) {
        // Maybe access token's time is not expired, but it's revoked?
        // We need to retry this request after force token refresh.
        throw new FrostError(
          '로그인 정보가 올바르지 않아요,\n죄송하지만 다시 로그인 해주세요.',
          `AccessToken이 올바르지 않고, 서버가 ${this.subCode}를 반환했습니다.`,
          this.code, true);
      } else if (this.subCode === 'user.not_signed_in') {
        throw new FrostError(
          '로그인이 되어 있지 않아요,\n로그인 해주세요.',
          '서버가 "user.not_signed_in"를 반환했습니다.', this.code);
      } else {
        return this;
        // throw new FrostError(
        //   '서버와의 통신에서 문제가 발생했어요,\n잠시 후 다시 시도해주세요.',
        //   `서버가 "${this.subCode === '' ? "sub_code 없음" : this.subCode}"를 반환했습니다.`, this.code);
      }
    }
  }
}
