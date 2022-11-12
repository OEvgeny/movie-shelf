import { getFiles } from "../../files"

export default defineEventHandler(async ({ res }) => {
  res.setHeader('Cache-Control', 'no-cache')
  return await getFiles()
})
