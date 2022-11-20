import { fetchTMDB } from "../../processMovies"
import { handleFileUpdate } from "../../files"

export default defineEventHandler(async (ev) => {
  const body = await readBody(ev)
  const id = ev.context.params.id
  if (!body) {
    return createError({ statusCode: 400, statusMessage: 'No body'})
  }
  let file: unknown
  try {
    const { tmdbId, type, isUpdated = true } = body
    const isDeleted = !!body.isDeleted
    const entry = tmdbId && type ? { type, result: await fetchTMDB(`${type}/${tmdbId}`) } : undefined
    file = handleFileUpdate(
      {
        tmdb: isDeleted || !entry ? { type: 'suggestions', result: [entry].filter(e => e) } : entry, 
        state: { 
          isDeleted,
          isUpdated: !!isUpdated 
        }
      },
      id
    )
  } catch (err) {
    // @ts-expect-error
    return createError({ statusCode: 400, statusMessage: err?.message, state: { isDefined: !!body.isDeleted } })
  }
  return file
})
