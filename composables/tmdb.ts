import { $fetch } from 'ohmyfetch'
import LRU from 'lru-cache'
import { hash as ohash } from 'ohash'
import type { Credits, Media, MediaType, PageResult, Person } from '../types'
import { getConfig } from './utils'

const cache = new LRU({
  max: 500,
  ttl: 2000 * 60 * 60, // 2 hour
})

function _fetchTMDB(url: string, params: Record<string, string | number | undefined> = {}) {
  const tmdbUrl = new URL('/tmdb', getConfig().public.proxy.url).toString()
  return $fetch(url, {
    baseURL: tmdbUrl,
    params: { ...params },
  })
}

export function fetchTMDB(url: string, params: Record<string, string | number | undefined> = {}): Promise<any> {
  const hash = ohash([url, params])
  if (!cache.has(hash)) {
    cache.set(
      hash,
      _fetchTMDB(url, params)
        .catch((e) => {
          cache.delete(hash)
          throw e
        }),
    )
  }
  return cache.get(hash)!
}

export function listMedia(type: MediaType, query: string, page: number): Promise<PageResult<Media>> {
  return fetchTMDB(`${type}/${query}`, { page })
}

export function getMedia(type: MediaType, id: string): Promise<Media> {
  return fetchTMDB(`${type}/${id}`, {
    append_to_response: 'videos,credits,images,external_ids,release_dates',
    include_image_language: 'ru,en,null',
  })
}

/**
 * Get recommended
 */
export function getRecommendations(type: MediaType, id: string, page = 1): Promise<PageResult<Media>> {
  return fetchTMDB(`${type}/${id}/recommendations`, { page })
}

/**
 * Get TV show episodes from season (single)
 */
export function getTvShowEpisodes(id: string, season: string) {
  return fetchTMDB(`tv/${id}/season/${season}`)
}

/**
 * Get trending
 */
export function getTrending(media: string, page = 1) {
  return fetchTMDB(`trending/${media}/week`, { page })
}

/**
 * Discover media by genre
 */
export function getMediaByGenre(media: string, genre: string, page = 1): Promise<PageResult<Media>> {
  return fetchTMDB(`discover/${media}`, {
    with_genres: genre,
    page,
  })
}

/**
* Get credits
*/
export function getCredits(id: string | number, type: string): Promise<Credits> {
  return fetchTMDB(`person/${id}/${type}`)
}

/**
 * Get genre list
 */
export function getGenreList(media: string): Promise<{ name: string; id: number }[]> {
  return fetchTMDB(`genre/${media}/list`, { language: undefined }).then(res => res.genres)
}

/**
 * Get person (single)
 */

export function getPerson(id: string): Promise<Person> {
  return fetchTMDB(`person/${id}`, {
    append_to_response: 'images,combined_credits,external_ids',
    include_image_language: 'ru,en,null',
  })
}

/**
 * Search (searches movies, tv and people)
 */

export function searchShows(query: string, page = 1) {
  return fetchTMDB('search/multi', { query, page, include_adult: 'true' })
}

