import { fetchMU } from '@local/network/client'
import { SignInHistory, User } from '@local/network/schema/user.d'

export const fetchMyInfo = async () => {
  const response = await fetchMU({
    route: '/user/info/me/',
    method: 'GET',
    requireAuth: true,
    checkStatus: true,
    checkJSONParsable: true,
  })
  return JSON.parse(response.body) as User
}

export const fetchAllSignedInHistories = async () => {
  const response = await fetchMU({
    route: '/authn/signin-history/',
    method: 'GET',
    requireAuth: true,
    checkStatus: true,
    checkJSONParsable: true,
  })
  return JSON.parse(response.body) as SignInHistory[]
}

export const deleteSignInHistory = async (uuid: string) => {
  await fetchMU({
    route: `/authn/signin-history/${uuid}`,
    method: 'DELETE',
    requireAuth: true,
    checkStatus: true,
  })
}
