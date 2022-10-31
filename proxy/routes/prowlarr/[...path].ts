import { $fetch } from 'ohmyfetch'
import { getQuery } from 'ufo'

const PROWLARR_API_URL = new URL('/api/v1/', useRuntimeConfig().prowlarr.url).toString()

export default defineEventHandler(async (event) => {
  const method = useMethod(event)
  if (method === 'OPTIONS') return
  const body = await readBody(event).catch(e => console.log(e))
  // eslint-disable-next-line no-console
  console.log('Fetching Prowarr', method, event.req.url, body ?? '')
  const config = useRuntimeConfig()
  try {
    return await $fetch(event.context.params.path, {
      method,
      body,
      baseURL: PROWLARR_API_URL,
      headers: {
        'X-Api-Key': config.prowlarr.apiKey,
      },
      params: {
        ...getQuery(event.req.url!),
      },
    })
  }
  catch (e: any) {
    const status = e?.response?.status || 500
    event.res.statusCode = status
    return e.message
  }
})
