import { getFiles } from "../../storage"

export default defineEventHandler(async ({ res }) => {
  res.setHeader('Cache-Control', 'no-cache')
  return await getFiles()
})
