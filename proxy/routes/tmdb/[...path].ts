import { $fetch } from 'ohmyfetch'
import { getQuery } from 'ufo'

const TMDB_API_URL = new URL('/3', useRuntimeConfig().tmdb.url).toString()

export default defineEventHandler(async (event) => {
  const method = useMethod(event)
  if (method === 'OPTIONS') return
  // eslint-disable-next-line no-console
  console.log('Fetching TMDB', method, event.req.url)
  const config = useRuntimeConfig()
  try {
    return await $fetch(event.context.params.path, {
      baseURL: TMDB_API_URL,
      params: {
        api_key: config.tmdb.apiKey,
        language: config.tmdb.lang,
        ...getQuery(event.req.url!),
      },
    })
  }
  catch (e: any) {
    const status = e?.response?.status || 500
    event.res.statusCode = status
    return e.message?.replace(/\?api_key=.*/, '')
  }
})
