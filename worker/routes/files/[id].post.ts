import { getFiles, setFiles } from "../../storage"

export default defineEventHandler(async (ev) => {
  const body = await readBody(ev)
  const id = ev.context.params.id
  if (!body) {
    return createError({ statusCode: 400, statusMessage: 'No body'})
  }
  body.id = id
  try {
    await setFiles([body])
  } catch (err) {
    return createError({ statusCode: 400, statusMessage: err?.message })
  }
  return (await getFiles()).find((item: { id: string }) => item.id === body.id)
})
