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
    const { tmdbId, type } = body
    const entry = await fetchTMDB(`${type}/${tmdbId}`)
    file = handleFileUpdate({ tmdb: { type, result: entry } }, id)
  } catch (err) {
    // @ts-expect-error
    return createError({ statusCode: 400, statusMessage: err?.message })
  }
  return file
})
