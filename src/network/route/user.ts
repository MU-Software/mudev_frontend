import { fetchMU } from '@local/network/client'
import { User } from '@local/network/schema/user.d'

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
