import { wildcardCheck } from "@util/string_util";

const PLEASE_NOTIFY_TO_ADMIN = '\n10분 후에 다시 시도해주세요.\n(만약 이 메시지를 계속 보시게 된다면 관리자에게 알려주세요!)';

export const APIErrorMessage = {
  DEFAULT_SERVER_ERROR: `서버에 알 수 없는 문제가 발생했어요,${PLEASE_NOTIFY_TO_ADMIN}`,
  DEFAULT_API_ERROR: `알 수 없는 문제가 발생했어요,\n${PLEASE_NOTIFY_TO_ADMIN}`,
  WRONG_REQUEST: `잘못된 요청이에요,\n${PLEASE_NOTIFY_TO_ADMIN}`,
  RESPONSE_IS_NULL: `서버기 응답이 없어요,\n${PLEASE_NOTIFY_TO_ADMIN}`,
  API_NOT_FOUND: `알 수 없는 경로로 요청을 주셨어요,\n${PLEASE_NOTIFY_TO_ADMIN}`,
  REQUEST_TOO_FREQUENT: '요청이 너무 빈번해요,\n조금 천천히 진행해주세요.',
  REQUEST_BODY_EMPTY: '입력하신 정보가 서버에 제대로 닿지 않았어요,\n새로고침 후 다시 시도해주세요.',
  REQUEST_BODY_LACK: '입력하신 정보 중 누락된 부분이 있어요,\n다시 입력해주세요.',
  REQUEST_BODY_INVALID: '입력하신 정보가 올바르지 않아요,\n다시 입력해주세요.',
  REQUEST_BODY_CONTAINS_INVALID_CHAR: '허용되지 않는 문자가 포함되어 있어요,\n다시 입력해주세요.',
  SIGN_IN_REQUIRED: '로그인이 필요한 기능입니다,\n로그인 해주세요.',
  TOKEN_INVALID: '로그인 인증 정보가 올바르지 않아요,\n죄송하지만 다시 로그인 해주세요.',
  PERMISSION_DENIED: '해당 동작에 대한 권한이 없습니다.\n만약 권한을 가지고 계셔야 한다면 관리자에게 연락 부탁드립니다.',
  INVALID_EMAIL: '이메일 형식이 올바르지 않아요,\n다시 입력해주세요.',
}

export const AccountErrorMessage = {
  NOT_FOUND: '계정을 찾지 못했어요,\n아이디나 이메일을 다시 확인해주세요.',
  WRONG_PASSWORD: '비밀번호가 맞지 않아요,\n다시 입력해주세요.',
  WRONG_CURRENT_PASSWORD: '현재 사용 중인 비밀번호와 맞지 않아요,\n다시 입력해주세요.',
  WRONG_PASSWORD_WITH_WARNING: '비밀번호가 맞지 않아요.\n({0}번을 더 틀리시면 계정이 잠겨요.)',
  INFO_MISMATCH: '계정 정보가 다른 곳에서 변경된 것 같아요,\n새로고침 후 다시 시도해주세요.',
  LOCKED: '계정이 잠겼습니다, 관리자에게 연락해주세요.\n(잠긴 이유: {0})',
  DEACTIVATED: '계정이 비활성화되었습니다, 관리자에게 연락해주세요.\n(잠긴 이유: {0})',
  EMAIL_NOT_VERIFIED: '아직 가입 시 적으신 메일 주소를 인증하지 않으셨어요,\n메일함을 확인 후 메일 인증을 진행해주세요.',
  DEACTIVATE_FAIL_AS_ACCOUNT_LOCKED: (
    '계정이 잠겨있어서 비활성화를 할 수 없습니다,\n'
    + '계정을 잠근 상태에서 해제한 후 다시 시도해주세요.\n'
    + '(계정이 잠긴 이유: {0})'
  ),
  DEACTIVATE_FAIL_AS_ALREADY_DEACTIVATED: (
    '계정이 이미 비활성화가 되어있습니다,\n'
    + '이용해주셔서 감사합니다!\n'
    + '(계정이 비활성화된 이유: {0})'
  ),
  FIELD_VALUE_ALREADY_USED: '입력하신 {0} 이미 다른 계정에서 사용 중이에요.',
  EMAIL_NOT_VALID: '이메일 형식이 올바르지 않아요,\n다시 입력해주세요.',
  PASSWORD_NOT_VALID: '입력하신 {0}비밀번호는 영문 대소문자/숫자/특수문자 중 2가지를 혼용해서 최소 9자로 입력해주세요',
  ID_NOT_VALID: '입력하신 {0}아이디는 4 ~ 47자 사이의 길이로 입력해주세요.',
  FIELD_NOT_VALID: '입력하신 정보가 올바르지 않아요,\n새로고침 후 다시 시도해주세요.',
}

export type DetailedAPIErrorMessageType = {
  message: string;
  debugMessage: string;
};

export const APIErrorMessageMap: Record<string, DetailedAPIErrorMessageType> = {
  'request.body.empty': {
    message: APIErrorMessage.REQUEST_BODY_LACK,
    debugMessage: '요청에 필요한 데이터가 없어요.',
  },
  'request.body.invalid': {
    message: APIErrorMessage.REQUEST_BODY_INVALID,
    debugMessage: '요청에 필요한 데이터가 유효하지 않아요.',
  },
  'request.header.*': {
    message: APIErrorMessage.DEFAULT_API_ERROR,
    debugMessage: '요청의 헤더에 문제가 있어요.',
  },
  'user.not_signed_in': {
    message: APIErrorMessage.SIGN_IN_REQUIRED,
    debugMessage: '로그인이 필요한 요청이에요.(user.not_signed_in)',
  },
  'access_token.*': {
    // Caution: There can be a case that access token is revoked, even though time is not expired.
    // We need to retry this request after force token refresh.
    message: APIErrorMessage.TOKEN_INVALID,
    debugMessage: "올바르지 않은 AccessToken입니다.",
  },
  'refresh_token.*': {
    message: APIErrorMessage.TOKEN_INVALID,
    debugMessage: "올바르지 않은 RefreshToken입니다.",
  },
  'backend.*': {
    message: APIErrorMessage.DEFAULT_SERVER_ERROR,
    debugMessage: 'backend error입니다.',
  },
  'http.*': {
    message: APIErrorMessage.DEFAULT_API_ERROR,
    debugMessage: 'http error입니다.',
  },
  'parse_error': {
    message: APIErrorMessage.DEFAULT_API_ERROR,
    debugMessage: 'API 응답을 파싱하지 못했습니다.',
  }
};

export const getAPIErrorMessage = (sub_code: string): DetailedAPIErrorMessageType => {
  for (const [key, value] of Object.entries(APIErrorMessageMap))
    if (wildcardCheck(key, sub_code)) return value;

  return {
    message: APIErrorMessage.DEFAULT_API_ERROR,
    debugMessage: `알 수 없는 에러입니다. (sub_code: ${sub_code})`,
  };
};
