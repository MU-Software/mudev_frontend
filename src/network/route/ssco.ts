import { fetchMU } from '@local/network/client'
import { SSCoVideoInfo } from '@local/network/schema/ssco.d'

export const fetchVideoList = async () => {
  const response = await fetchMU({
    route: '/ssco/ytdl/',
    method: 'GET',
    requireAuth: true,
    checkStatus: true,
    checkJSONParsable: true,
  })
  return JSON.parse(response.body) as SSCoVideoInfo[]
}

export const addVideo = async (url: string) =>
  await fetchMU({
    route: '/ssco/ytdl/',
    method: 'POST',
    requireAuth: true,
    checkStatus: true,
    body: JSON.stringify({ url }),
  })
