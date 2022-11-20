import { useSingleton } from './utils'
import type { File, FileTMDBMedia, Image, Media, MediaType, Video } from '~/types'

export function getTrailer(item: Media) {
  const trailer = item.videos?.results?.find(video => video.type === 'Trailer')
  return getVideoLink(trailer)
}

export function getVideoLink(item?: Video) {
  if (!item?.key)
    return null
  return `https://www.youtube.com/embed/${item.key}?rel=0&showinfo=0&autoplay=0`
}

const [
  provideIframeModal,
  useIframeModal,
] = useSingleton<(url: string) => void>()

const [
  provideImageModal,
  useImageModal,
] = useSingleton<(photos: Image[], index: number) => void>()

const [
  provideImportModal,
  useImportModal,
] = useSingleton<(suggestions: FileTMDBMedia[], entry: File) => void>()

const [
  provideEditModal,
  useEditModal,
] = useSingleton<(entry: Media, type: MediaType) => void>()

const [
  provideNotificationsState,
  useNotifications,
] = useSingleton<typeof notifications>()

const notifications = createNotificationsService()


const provideNotifications = (paneState: typeof notifications['pane']) => {
  notifications.pane = paneState
  provideNotificationsState(notifications)
  return notifications
}

export const { notify, dismiss, dismissAll } = notifications

export {
  useIframeModal,
  provideIframeModal,
  useImageModal,
  provideImageModal,
  provideImportModal,
  useImportModal,
  provideEditModal,
  useEditModal,
  provideNotifications,
  useNotifications,
}
