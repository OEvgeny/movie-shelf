import { getConfig } from "./utils"

const data = ref([])

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
  data.value = await $fetch(url)
}

export const initConnection = process.client ? initClientConnection : initServerConnection

const extractTMDBEntry = ({ tmdb }) => tmdb.result

export const movies = reactive({
  items: computed(() => data.value.filter(({ tmdb }) => tmdb.type === 'movie').map(extractTMDBEntry)),
})

export const shows = reactive({
  items: computed(() => data.value.filter(({ tmdb }) => tmdb.type === 'tv').map(extractTMDBEntry)),
})

export const imports = reactive({
  items: computed(() => data.value.filter(({ tmdb }) => tmdb.type === 'suggestions').map(extractTMDBEntry)),
  files: computed(() => data.value.filter(({ tmdb }) => tmdb.type === 'suggestions'))
})

export const getFiles = (t: string, id: string) => data.value.find(({ tmdb: {type, result} }) => result?.id === id && type === t)?.files?.files
export const getFilesRoot = (t: string, id: string) => data.value.find(({ tmdb: {type, result} }) => result?.id === id && type === t)

export const updateFile = (file: any, fields: any) => {
  const baseURL = new URL('/files', getConfig().public.worker.url).toString()
  $fetch(`/${file.id}`, { baseURL, method: 'POST', body: fields })
}