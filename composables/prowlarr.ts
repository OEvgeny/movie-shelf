import { $fetch } from 'ohmyfetch'
import LRU from 'lru-cache'
import { hash as ohash } from 'ohash'
import { getConfig } from './utils'

const cache = new LRU({
  max: 500,
  ttl: 2000 * 60 * 60, // 2 hour
})

function _fetchProwlarr(url: string, params: Record<string, string | number | undefined> = {}, method?, body?) {
  const prowlarrUrl = new URL('/prowlarr', getConfig().public.proxy.url).toString()
  return $fetch(url, {
    method,
    body,
    baseURL: prowlarrUrl,
    params: { ...params },
  })
}

export function fetchProwlarr(url: string, params: Record<string, string | number | undefined> = {}, method?, body?): Promise<any> {
  if (method) {
    return _fetchProwlarr(...arguments)
  }
  const hash = ohash([url, params])
  if (!cache.has(hash)) {
    cache.set(
      hash,
      _fetchProwlarr(url, params)
        .catch((e) => {
          cache.delete(hash)
          throw e
        }),
    )
  }
  return cache.get(hash)!
}

/**
 * Search (searches movies, tv and people)
 */

export function searchProwlarr(query: string, type = 'search') {
  return fetchProwlarr('search', { query, type })
}

export function saveToProwlarr(body) {
  return fetchProwlarr('search', {}, 'POST', body)
}

