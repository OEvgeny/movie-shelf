import { handleConnection } from '../../files'

export default defineEventHandler(({ res }) => handleConnection(res))
