import * as jose from 'jose'
import * as R from 'remeda'

import { SignUpRequest, User } from '@local/network/schema/user.d'
import { isFilledString, isJSONParsable } from '@local/util/string_util'

export type FetchMethod = 'HEAD' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type MURequestOption = {
  route: string
  method: FetchMethod
  headers?: HeadersInit
  body?: BodyInit
  timeout?: number
  requireAuth?: boolean
  checkStatus?: boolean
  checkJSONParsable?: boolean
  tag?: string
}

export class MURequestError extends Error {
  constructor(
    public message: string,
    public status: number,
    public readonly requireAuth: boolean,
    public readonly option: MURequestOption,
    public readonly response?: Response
  ) {
    super(message)
  }
}

export type MUResponse = { status: number; body: string; response: Response }

export const MURequest: (option: MURequestOption) => Promise<MUResponse> = async (option) => {
  const hostURL = option.route.startsWith('/user')
    ? import.meta.env.VITE_API_AUTH_SERVER
    : import.meta.env.VITE_API_SERVER

  const bodyOption = {} as { body?: BodyInit }
  if (option.body && ['POST', 'PUT', 'PATCH'].includes(option.method)) {
    if (!(option.body instanceof FormData)) {
      option.headers = { ...(option.headers ?? {}), 'Content-Type': 'application/json' }
    }
    bodyOption['body'] = option.body
  }

  const response = await fetch(hostURL + option.route, {
    method: option.method,
    cache: 'no-cache',
    redirect: 'follow',
    credentials: 'include',
    headers: option.headers,
    signal: AbortSignal.timeout(option.timeout ?? 5000),
    ...bodyOption,
  })
  const body = option.method === 'HEAD' ? '' : await response.text()
  const errArgs = [response.status, option.requireAuth ?? false, option, response] as const
  const jsonParseFailErrMsg = '무언가가 잘못된 것 같아요, 잠시 후 다시 시도해주세요.\n(서버의 응답을 이해할 수 없어요.)'

  if (option.checkStatus && !response.ok) throw new MURequestError(body, ...errArgs) // TODO: 적절한 에러 메시지를 띄우도록 수정
  if (option.checkJSONParsable && option.method !== 'HEAD' && !isJSONParsable(body))
    throw new MURequestError(jsonParseFailErrMsg, ...errArgs)
  return { status: response.status, body, response } as MUResponse
}

type Token = {
  exp: number
  iss: string // Domain
  jti: string // UUID
  sub: 'access'
  user: string // UUID
  user_agent: string
}

function isObjValidAccessToken(token?: unknown): token is Token {
  return (
    R.isObject(token) &&
    R.isNumber(token.exp) &&
    R.isString(token.iss) &&
    R.isString(token.jti) &&
    R.isString(token.sub) &&
    R.isString(token.user) &&
    R.isString(token.user_agent) &&
    token.sub === 'access' &&
    token.exp > Date.now() / 1000
  )
}

const parseToken: (tokenStr?: string | null) => Promise<Token | undefined> = async (tokenStr) => {
  if (!isFilledString(tokenStr)) return undefined
  let token: Token
  try {
    token = jose.decodeJwt(tokenStr)
    if (!isObjValidAccessToken(token)) return undefined
    await checkAccessToken(tokenStr)
    return token
  } catch (e) {
    return undefined
  }
}

const retrieveCSRFToken: () => Promise<MUResponse> = () => MURequest({ route: '/user/csrf/', method: 'HEAD' })
const retrieveAccessTokenStr: () => Promise<string | undefined> = async () => {
  try {
    const response = await MURequest({
      route: '/user/refresh/',
      method: 'GET',
      checkJSONParsable: true,
      checkStatus: true,
    })
    return JSON.parse(response.body).access_token
  } catch (e) {
    return undefined
  }
}
const checkAccessToken: (access_token: string) => Promise<MUResponse> = (access_token) =>
  MURequest({
    route: '/user/verify/',
    method: 'PUT',
    headers: { Authorization: `Bearer ${access_token}` },
    checkStatus: true,
    checkJSONParsable: true,
  })

const setAccessTokenToSessionStorage: (token: string) => void = (token) => sessionStorage.setItem('access_token', token)
const getAccessTokenFromSessionStorage: () => string | null | undefined = () => sessionStorage.getItem('access_token')

const retrieveTokenStr: () => Promise<string | undefined> = async () => {
  await retrieveCSRFToken()
  const tokenStr = getAccessTokenFromSessionStorage()
  if (await parseToken(tokenStr)) return tokenStr as string

  // If local token is expired or not exist, reset session storage and retrieve new token
  setAccessTokenToSessionStorage('')
  const retrievedTokenStr = await retrieveAccessTokenStr()
  const retrievedToken = parseToken(retrievedTokenStr)
  if (!retrievedTokenStr || !retrievedToken) return undefined

  setAccessTokenToSessionStorage(retrievedTokenStr)
  return retrievedTokenStr
}

export const signIn = async (formData: FormData) => {
  const response = await MURequest({
    route: '/user/signin/',
    method: 'POST',
    body: formData,
    checkStatus: true,
    checkJSONParsable: true,
  })
  const responsePayload = JSON.parse(response.body) as { access_token: string; token_type: 'bearer' }
  setAccessTokenToSessionStorage(responsePayload.access_token)
  return responsePayload
}

export const signUp = async (newUserInfo: SignUpRequest) => {
  const response = await MURequest({
    route: '/user/signup/',
    method: 'POST',
    body: JSON.stringify(newUserInfo),
    checkStatus: true,
    checkJSONParsable: true,
  })
  return JSON.parse(response.body) as User
}

export const signOut = async () => {
  setAccessTokenToSessionStorage('')
  await MURequest({ route: '/user/signout/', method: 'DELETE', requireAuth: true, checkStatus: true })
}

export const isSignedIn = async () => isFilledString(await retrieveTokenStr())

export const fetchMU = async (option: MURequestOption) => {
  const headers = new Headers(option.headers)
  if (option.requireAuth) {
    const tokenStr = await retrieveTokenStr()
    if (!tokenStr) throw new MURequestError('로그인이 되어있지 않아요, 로그인 해 주세요!', 401, true, option)
    headers.append('Authorization', `Bearer ${tokenStr}`)
  }

  return await MURequest({ ...option, headers })
}
