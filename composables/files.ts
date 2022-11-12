import { File, FileTMDBMedia, FileTMDBSuggestions, Media } from "~~/types";
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
  const url = new URL('/files/live', getConfig().public.worker.url).toString()
  const source = new EventSource(url, { withCredentials: true })

  source.addEventListener('files', event => {
    data.value = JSON.parse(event.data)
    // @ts-expect-error
    resolve()
  })
  
  source.addEventListener('file', (event) => {
    const file = JSON.parse(event.data)
    const index = data.value.findIndex(f => f.id === file.id)
    if (index !== -1) {
      data.value[index] = file
    } else {
      data.value.push(file)
      sortData()
    }
  })
})

const initServerConnection = async () => {
  const url = new URL('/files', getConfig().public.worker.url).toString()
  // @ts-expect-error
  data.value = await $fetch(url)
}

export const initConnection = process.client ? initClientConnection : initServerConnection

const extractTMDBEntry = ({ tmdb }: File) => tmdb?.result

const allMovies = computed(() => data.value
  .filter(({ tmdb }) => tmdb?.type === 'movie')
  .map(extractTMDBEntry) as Media[])

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
  items: computed(() => data.value.filter(({ tmdb }) => tmdb?.type === 'tv').map(extractTMDBEntry)),
})

export const imports = reactive({
  items: computed(() => data.value.filter(({ tmdb }) => tmdb?.type === 'suggestions').map(extractTMDBEntry)) as unknown as FileTMDBMedia[][],
  files: computed(() => data.value.filter(({ tmdb }) => tmdb?.type === 'suggestions')) as unknown as File<FileTMDBSuggestions>[]
})

export const getFiles = (t: string, id: string) => data.value.find(({ tmdb: {type, result} }) => result?.id === id && type === t)?.files?.files
export const getFilesRoot = (t: string, id: string) => data.value.find(({ tmdb: {type, result} }) => result?.id === id && type === t)

export const updateFile = (file: File, fields: Record<string, unknown>) => {
  const baseURL = new URL('/files', getConfig().public.worker.url).toString()
  $fetch(`/${file.id}`, { baseURL, method: 'POST', body: fields })
}