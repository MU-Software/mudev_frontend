import { File } from './file.d'

export type SSCoVideoInfo = {
  youtube_vid: string
  title: string
  thumbnail_uuid: string
  data: Record<string, unknown>
  files: File[]
}
