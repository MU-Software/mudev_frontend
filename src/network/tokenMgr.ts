import R from 'remeda'

type Token = {
  exp: number
  iss: string // Domain
  jti: string // UUID
  sub: 'access'
  user: string // UUID
  user_agent: string
}

const parseToken: (tokenStr?: string) => Token | null = (tokenStr) => {
  if (R.isEmpty(tokenStr)) return null
  const [, payload] = tokenStr.split('.')
  if (R.isEmpty(payload)) return null

  try {
    return JSON.parse(atob(payload)) as Token
  } catch (e) {
    return null
  }
}

const isTokenExpired: (token?: Token) => boolean = (token) => {
  if (!token) return true
  return token.exp <= Date.now() / 1000
}

const isTokenValid: (token?: Token) => boolean = (token) => {
  if (!token) return false
  if (token.sub !== 'access') return false
  if (token.iss !== new URL(import.meta.env.VITE_API_SERVER).hostname) return false
  return !isTokenExpired(token)
}

const retrieveToken: (ident: string, password: string) => Token | null = (ident, password) => {
  fetch(`${import.meta.env.VITE_API_SERVER}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    body: JSON.stringify({ ident, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
    })
    .catch((err) => {
      console.error(err)
    })
}

const refreshToken: () => Promise<Token | null> = async () => {}
