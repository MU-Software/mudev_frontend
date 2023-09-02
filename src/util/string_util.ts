export const wildcardCheck: (i: string, m: string) => boolean = (i, m) => {
  const regExpEscape = (s: string) => s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

  const mm = new RegExp('^' + m.split(/\*+/).map(regExpEscape).join('.*') + '$');
  const result: RegExpMatchArray | null = i.match(mm);
  return result !== null && result.length >= 1;
};

// From https://stackoverflow.com/a/40031979
export const buf2hex = (buffer: ArrayBufferLike) => {
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
};

// Generate random safe string
export const generateRandomSecureToken = (bytes: number) => {
  const randArray = new Uint32Array(bytes);
  window.crypto.getRandomValues(randArray);
  return buf2hex(randArray);
};

export const _f = (str: string, ...val: string[]) => {
  for (let index = 0; index < val.length; index++) {
    str = str.replace(`{${index}}`, val[index]);
  }
  return str;
}

export const getAlreadyUsedFieldName = (field: string) => {
  switch (field) {
    case 'email': return '이메일은';
    case 'id': return '아이디는';
    case 'nick': return '별명은';
    default: return '정보는';
  }
};

export const getPasswordFailureReason = (reason: string) => {
  switch (reason.toLowerCase()) {
    case 'too_short': return '비밀번호가 너무 짧아요,\n';
    case 'too_long': return '1024자가 넘는 비밀번호는 쓰기에 불편하지 않을까요?\n';
    case 'need_more_char_type': return '비밀번호가 너무 단순해요,\n';
    case 'forbidden_char': return '비밀번호에 쉽게 입력할 수 없는 문자가 들어있어요,\n';
    case 'pw_reused_on_id_email_nick': return '비밀번호가 이메일, 별칭, 또는 아이디에 포함되어 있어요,\n';
    case 'retype_mismatch': return '위에 입력하신 새 비밀번호와 일치하지 않아요,\n새 비밀번호를 다시 입력해주세요.\n';
    default: return '사용할 수 있는 비밀번호가 아니에요,\n';
  }
};

export const getIDFailureReason = (reason: string) => {
  switch (reason.toLowerCase()) {
    case 'too_short': return '아이디가 너무 짧아요,\n';
    case 'too_long': return '아이디가 너무 길어요,\n';
    case 'forbidden_char': return '아이디에 쉽게 입력할 수 없는 문자가 들어있어요,\n';
    default: return '사용할 수 있는 아이디가 아니에요,\n';
  }
};
