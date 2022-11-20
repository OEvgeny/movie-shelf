import { File, FileTMDBMedia, FileTMDBSuggestions, Media } from "~~/types";
import { notify } from "./item";
import { getConfig } from "./utils"

const data = ref<File[]>([])

const sortData = () => {
  data.value.sort((a, b) => {
    const lastModifiedA = Date.parse(a.lastModified)
    const lastModifiedB = Date.parse(b.lastModified)
    return lastModifiedA > lastModifiedB
      ? -1
      : lastModifiedB > lastModifiedA
      ? 1
      : 0
  })
}

let inProgress: Promise<undefined> | undefined
const initClientConnection = () => inProgress = inProgress ?? new Promise(resolve => {
  const openImportModal = useImportModal()
  const router = useRouter()
  const url = new URL('/files/live', getConfig().public.worker.url).toString()
  const source = new EventSource(url, { withCredentials: true })

  const checkConnection = () => setTimeout(() => {
    if (source.readyState === source.CLOSED) {
      inProgress = undefined
      initClientConnection()
    } else {
      checkConnection()
    }
  }, 60000)
  checkConnection()

  source.addEventListener('files', event => {
    data.value = JSON.parse(event.data)
    // @ts-expect-error
    resolve()
    resolve = () => {}
  })
  
  source.addEventListener('file', (event) => {
    const file: File = JSON.parse(event.data)
    const index = data.value.findIndex(f => f.id === file.id)
    const previousFile: File = data.value[index]
    if (previousFile) {
      data.value[index] = file
    } else {
      data.value.push(file)
      sortData()
    }

    switch (file.tmdb.type) {
      case 'movie':
        notify(file.id, {
          title: !previousFile ? 'New movie available' : 'Movie updated',
          media: file.tmdb.result,
          action: () => router.push(`/${file.tmdb.type}/${file.tmdb.result.id}`)
        })
        break
      case 'tv':
        notify(file.id, {
          title: !previousFile ? 'New TV show available' : 'TV Show updated',
          media: file.tmdb.result,
          action: () => router.push(`/${file.tmdb.type}/${file.tmdb.result.id}`)
        })
        break
      default:
        if (previousFile) {
          notify(file.id, {
            title: 'Entry deleted',
            media:  previousFile.tmdb.result as Media,
            action: () => openImportModal(file.tmdb?.result ?? [], file)
          })
        } else {
          notify(file.id, {
            title: 'No matches found',
            media:  {
              title: file.search?.query
            },
            action: () => openImportModal(file.tmdb?.result ?? [], file)
          })
        }
    }
  })

  source.addEventListener('scan-complete', () => notify('scan-complete', {
    title: 'Scan complete',
    subtitle: `${data.value.length} entries processed`,
    type: 'success',
    action: () => useRouter().push('/watch')
  }))
})

const initServerConnection = async () => {
  const url = new URL('/files', getConfig().public.worker.url).toString()
  // @ts-expect-error
  data.value = await $fetch(url)
}

export const initConnection = process.client ? initClientConnection : initServerConnection

const extractTMDBEntry = <T = Media | FileTMDBMedia[]>({ tmdb }: File):T => tmdb?.result as T

const dedupe = (arr: Media[]) => {
  const ids = new Set()
  return arr.filter(entry => ids.has(entry.id) ? false : ids.add(entry.id))
}

const allMovies = computed(() => dedupe(data.value
  .filter(({ tmdb }) => tmdb?.type === 'movie')
  .map(entry => extractTMDBEntry<Media>(entry))
))

export const adultMovies = reactive({
  items: computed(() => allMovies.value.filter(entry => entry.adult)),
})

export const kidsMovies = reactive({
  items: computed(() => allMovies.value.filter(entry => entry.kids)),
})

export const movies = reactive({
  items: computed(() => allMovies.value.filter(entry => !entry.adult)),
})

export const shows = reactive({
  items: computed(() => dedupe(data.value.filter(({ tmdb }) => tmdb?.type === 'tv').map(entry => extractTMDBEntry<Media>(entry)))),
})

export const imports = reactive({
  items: computed(() => data.value.filter(({ tmdb }) => tmdb?.type === 'suggestions').map(entry => extractTMDBEntry<FileTMDBMedia[]>(entry))),
  files: computed(() => data.value.filter(({ tmdb }) => tmdb?.type === 'suggestions')) as unknown as File<FileTMDBSuggestions>[]
})

export const getFilesRoots = (t: string, id: string) => data.value.filter(({ tmdb: {type, result} = {} }) => result?.id === id && type === t)
export const getFiles = (t: string, id: string) => ([] as File[]).concat(...getFilesRoots(t, id).map(file => file?.files?.files)).sort((a, b) => a.name.localeCompare(b.name))

export const updateFile = (file: File, fields: Record<string, unknown>) => {
  const baseURL = new URL('/files', getConfig().public.worker.url).toString()
  $fetch(`/${file.id}`, { baseURL, method: 'POST', body: fields })
}