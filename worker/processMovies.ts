// @ts-expect-error
import parse from 'parse-apache-directory-index'
import { $fetch } from 'ohmyfetch'

const cyrb53 = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

export const calculateEntryId = entry => {
  const { path, lastModified } = entry
  return cyrb53([path, lastModified].join('|')).toString(36)
}

const getFileList = async (url: string) => {
  const res = await fetch(url)
  const content = await res.text()
  const data = parse(content)
  for (const item of data.files) {
    item.url = new URL(item.path, url).toString()
  }
  return data
}

const filterTokens = ((arr: string[]) => arr)([
  /* file format */
  'mkv', 'avi',
  /* language */
  'rus', 'eng', 
  /* additional content */
  'sub', 
  /* source quality */
  'bdrip', 'hdtvrip', 
  /* resolution */
  '1080p', '720p', '1080i',
  /* audio encoder */
  'ddp5',
  /* video encoder */
  'x264', 'x265', 'mp4-ktr',
  /* content source */
  'tv-hd', 'atvp', 'web-dl', 'web-dlrip',
  /* release group */
  'kinozal', 'pk',
  /* content type */
  'xxx'
])

const formatFileName = (fileName: string) => fileName
  .replace(/\//g, '')
  .replace(/[\[\(]([^\)\]]+)+[\]\)]/g, (_, subString) => Number(subString) ? subString : '')
  .replace(/\.|\_/g, ' ')
  .split(/\s/)
  .map(token => token.toLowerCase())
  .filter(token => !filterTokens.includes(token))
  .join(' ')
  .replace(/\[|\]|\(|\)/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const getMovieSuggestedIds = async (fileName: string) => {
  const controller = new AbortController()
  const signal = controller.signal
  console.log('Processing file', fileName)
  const query = formatFileName(fileName)
  const options = {
    signal,
    parseResponse: txt => txt,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'
    }
  }
  const handleError = e => {
    console.log(e)
    return ''
  }
  setTimeout(() => controller.abort(), 5000)
  const contents = await Promise.all([
    $fetch('https://www.google.com/search?q=' + encodeURIComponent(`${query} tmdb`), options).catch(handleError),
    $fetch('https://www.bing.com/search?q=' + encodeURIComponent(`${query} tmdb`), options).catch(handleError)
  ])
  console.log('Fetched', contents.filter(c => c === '').length, 'for the file')
  const found = []
  for (const [engine, content] of contents.map((c, index) => [index === 0 ? 'google' : 'bing', c])) {
    const tmdbFound = Array.from(content.matchAll(/https:\/\/www\.themoviedb\.org\/(movie|tv)\/(\d+)/g)).map(([, type, id, title]) => ({type, id, engine, provider: 'tmdb'}))
    const imdbfound = Array.from(content.matchAll(/https:\/\/www\.imdb\.com\/(title)\/(tt\d+)/g)).map(([, type, id, title]) => ({type, id, engine, provider: 'imdb'}))
    found.push(...tmdbFound)
    found.push(...imdbfound)
  }
  const results: Record<string, string>[] = []
  for (const entry of found) {
    const result = results.find(r => r.id === entry.id && r.type === entry.type && r.provider === entry.provider && r.engine === entry.engine)
    if (result) result.count++
    else results.push({ ...entry, count: 1 })
  }
  console.log('Found', results.length, 'for the query', query)
  return { query, results }
}

const kidsCertifications = {
  US: ['P'],
  RU: ['0+', '3+'],
  CA: ['G'],
  AU: ['G'],
  NZ: ['G'],
  FI: ['S', 'K-7'],
  BG: ['A'],
  PH: ['G'],
  IE: ['G'],
  NO: ['6'],
  PT: ['M/3'],
}

const isKidsMovie = (movie: any) => {
  if (movie.adult) return false
  const releases = movie?.release_dates?.results ?? []
  const certifications: Array<{ 
    country: keyof typeof kidsCertifications, 
    certification: string
  }> = [].concat(...releases.map((release: any) => release.release_dates
    .filter((r: any) => r.certification)
    .map(({ certification }: any) => ({ country: release.iso_3166_1, certification }))
  ))
  return certifications.some(c => kidsCertifications[c.country]?.includes(c.certification))
}

export const fetchTMDB = async (url: string, params?: any | undefined) => {
  const { worker } = useRuntimeConfig()
  const baseURL = new URL('/tmdb/', worker.proxyUrl).toString()
  const handleError = (e: Error) => {
    console.error(e)
  }
  const result = await $fetch(url, { 
    baseURL, 
    query: {
      append_to_response: 'release_dates',
      ...params
    }
  }).catch(handleError)
  if (result) result.kids = isKidsMovie(result)
  return result
}

const getTMDBEntry = async (results: any[]) => {
  const mostLikelyGoogleResult = results.find(r => r.engine === 'google')
  const mostLikelyBingResult = results.find(r => r.engine === 'bing')
  let mostLikelyResult
  if (mostLikelyGoogleResult?.id === mostLikelyBingResult?.id) {
    mostLikelyResult = mostLikelyGoogleResult
  }
  if (mostLikelyResult) {
    const result = await fetchTMDB(`/${mostLikelyResult.type}/${mostLikelyResult.id}`)
    if (result) return { type: mostLikelyResult.type, result }
  }
  const imdbResult = results.find(r => r.provider === 'imdb')
  let firstImdbResult
  if (imdbResult) {
    const firstResult = mostLikelyGoogleResult ?? mostLikelyBingResult
    const info = await fetchTMDB(`/find/${imdbResult.id}`, { external_source: 'imdb_id' })
    if (info) {
      const [firstResultFromImdb] = (firstResult ? info[`${firstResult.type}_results`] : info.movie_results ?? info.tv_results) ?? []
      const type = firstResult.type ?? (info.movie_results && 'movie') ?? (info.tv_results && 'tv')
      if (firstResultFromImdb && results.some(r => r !== imdbResult && (r.id === firstResultFromImdb.id || r.id === firstResultFromImdb.imdb_id))) {
        return { result: firstResultFromImdb, type }
      }
      firstImdbResult = { result: firstResultFromImdb, type }
    }
  }
  let firstGoogleTmdb
  if (mostLikelyGoogleResult?.provider === 'tmdb') {
    const result = await fetchTMDB(`/${mostLikelyGoogleResult.type}/${mostLikelyGoogleResult.id}`)
    if (result && results.some(r => r !== mostLikelyGoogleResult && (r.id === result.id || r.id === result.imdb_id))) {
      return { result, type: mostLikelyGoogleResult.type }
    }
    firstGoogleTmdb = result && { result, type: mostLikelyGoogleResult.type }
  }
  let firstBingTmdb
  if (mostLikelyBingResult?.provider === 'tmdb') {
    const result = await fetchTMDB(`/${mostLikelyBingResult.type}/${mostLikelyBingResult.id}`)
    if (result && results.some(r => r !== mostLikelyBingResult && (r.id === result.id || r.id === result.imdb_id))) {
      return { result, type: mostLikelyBingResult.type }
    }
    firstBingTmdb = result && { result, type: mostLikelyBingResult.type }
  }
  const suggestions = [firstGoogleTmdb, firstBingTmdb, firstImdbResult].filter(s => s?.result)
  return suggestions.length > 1 || suggestions.length === 0 ? { type: 'suggestions', result: suggestions } : suggestions[0]
}

export const processMovies = async function* (url: string, storedFiles: any[]) { 
  const { files = [] } = await getFileList(url)
  console.log('Got', files.length, 'files from remote')
  let cachedCount = 0
  const processed = []
  for (const file of files) {
    file.id = calculateEntryId(file)
    const storedFile = storedFiles.find(f => f.id === file.id)
    if (storedFile) {
      Object.assign(file, storedFile)
      if (file.state?.isUpdated 
       || file.state?.isDeleted 
       || file.tmdb?.result
       || file.search?.results.some(entry => ['google', 'bing'].includes(entry.engine))
      ) {
        cachedCount++
        continue
      }
    }
    file.state = {
      isDeleted: false,
      isUpdated: false,
      ...file.state
    }
    file.search = await getMovieSuggestedIds(file.name)
    file.tmdb = await getTMDBEntry(file.search.results)
    if (file.type === 'directory') {
      file.files = await getFileList(`${url}${file.name}`)
    }
    processed.push(file)
    yield file
  }
  console.log('Processed', files.length, 'from cache', cachedCount)
  return files
}
