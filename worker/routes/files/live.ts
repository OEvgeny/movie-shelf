import { getFiles, subscribe } from "../../storage";
import { processMovies } from "../../processMovies";

import { EventEmitter } from 'node:events';

const emitter = new EventEmitter()

const writeEvent = (res: any, event: string, data?: any, delay = 60000) => {
  if (!res.writable) {
    res.emit('close')
    return
  }
  res.write(`event: ${event}\n`);
  delay && res.write(`retry: ${delay}\n`);
  data && res.write(`data: ${JSON.stringify(data)}\n`);
  res.write('\n')
}

let iteration: IteratorResult<any, any>
const updateFiles = async () => {
  if (iteration && !iteration.done) return
  iteration = { done: false, value: undefined }
  const files = await getFiles()
  const { worker } = useRuntimeConfig()
  const newFiles = processMovies(worker.remoteFolderUrl, files)
  while (iteration = await newFiles.next()) {
    if (iteration.done) {
      break
    } else {
      emitter.emit('file', iteration.value)
    }
  }
  await useStorage().setItem('db:files', iteration.value)
}

setInterval(() => {
  if (emitter.listenerCount('file')) updateFiles()
}, 60 * 1000)

export default defineEventHandler(async ({ req, res }) => {
  res.writeHead(200, {
    ...res.getHeaders(),
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream; charset=utf-8',
  })
  const files = iteration?.done && iteration?.value || await getFiles()
  console.log('Got stored files', files?.length)
  writeEvent(res, 'files', files)
  res.write('')

  const handleFileEvent = (file: any) => writeEvent(res, 'file', file)

  emitter.on('file', handleFileEvent)

  const stop = subscribe((newFiles: any[]) => {
    for (const file of newFiles) {
      handleFileEvent(file)
    }
  })

  // TODO: FIXME
  // The code bellow does nothing
  // There is no way on my machine to get SSE connection state
  // - res.socket.on('close') - doesn't happen
  // - res.writable - always true
  // - res.write() - never fails
  // - req.on('close') - never happens
  res.socket?.on('error', () => res.emit('close'))
  
  res.on('close', () => {
    console.log('Client closed connection', emitter.listenerCount('file'))
    stop()
    emitter.off('file', handleFileEvent)
    res.end()
  })

  await updateFiles()

  return new Promise((resolve) => { res.once('close', resolve)})
})
