import { ServerResponse } from 'node:http'
import { EventEmitter } from 'node:events'
import { processMovies } from "./processMovies"
import type { File } from '../types'

export const getFiles = async () => await useStorage().getItem('db:files').catch(e => {
  console.error(e)
  return []
}) || []

const setFiles = (newFiles: File[]) => useStorage().setItem('db:files', newFiles)

const constructFileUpdater = () => {
  let iteration: IteratorResult<any>
  let pendingFiles: File[] = []
  let storedFiles: File[] = []

  const emitter = new EventEmitter()

  const writeEvent = (res: ServerResponse, event: string, data: any = '', delay = 60000) => {
    if (!res.writable) {
      res.emit('close')
      return
    }
    res.write(`event: ${event}\n`)
    delay && res.write(`retry: ${delay}\n`)
    res.write(`data: ${JSON.stringify(data)}\n`)
    res.write('\n')
  };

  const clearIteration = () => {
    pendingFiles = []
    iteration = { done: true, value: undefined }
  };

  const performUpdate = async () => {
    if (!iteration?.done)
      return
    clearIteration()
    storedFiles = await getFiles()
    console.log('Got', storedFiles.length, 'files from storage')
    try {
      const { worker } = useRuntimeConfig()
      const newFiles = processMovies(worker.remoteFolderUrl, storedFiles)
      while (iteration = await newFiles.next()) {
        if (iteration.done) {
          break
        } else {
          pendingFiles.push(iteration.value)
          emitter.emit('file', iteration.value)
        }
      }
    } catch (err) {
      console.error(err)
      clearIteration()
    }
    const newFiles = iteration.value
    if (newFiles) {
      await setFiles(newFiles)
      // send all files if file deletion detected
      if (storedFiles.length && storedFiles.some(f => !newFiles.find(file => file.id === f.id))) {
        emitter.emit('files', newFiles)
      }
      storedFiles = newFiles
      pendingFiles = []
    }
    emitter.emit('done')
  }

  const getActiveConnectionsCount = () => emitter.listenerCount('files')

  const handleUpdate = () => {
    if (getActiveConnectionsCount())
      performUpdate()
  }

  const handleConnection = (res: ServerResponse) => {
    const connectionIndex = getActiveConnectionsCount() + 1

    const sendFile = (file: unknown) => writeEvent(res, 'file', file)
    const sendFiles = (files: unknown) => writeEvent(res, 'files', files)
    const sendScanComplete = () => writeEvent(res, 'scan-complete')

    const setupConnection = () => {
      emitter.on('file', sendFile)
      emitter.on('files', sendFiles)
      emitter.on('done', sendScanComplete)

      const teardown = () => {
        emitter.off('file', sendFile)
        emitter.off('files', sendFiles)
        emitter.off('done', sendScanComplete)
        res.end()
      }

      // TODO: FIXME
      // The code bellow does nothing
      // There is no way on my machine to get SSE connection state
      // - res.socket.on('close') - doesn't happen
      // - res.writable - always true
      // - res.write() - never fails
      // - req.on('close') - never happens
      // Update: prod logs show this works
      res.socket?.on('error', () => res.emit('close'))

      res.on('close', () => {
        console.log('Client closed connection', getActiveConnectionsCount())
        teardown()
      })
    }

    console.log('Got connection', connectionIndex)

    res.writeHead(200, {
      ...res.getHeaders(),
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream; charset=utf-8',
    })

    console.log('Sending', storedFiles.length, 'files to', connectionIndex)
    sendFiles(storedFiles)
    res.write('')

    if (!iteration?.done && pendingFiles?.length) {
      console.log('Sending', pendingFiles.length, 'pending files to', connectionIndex)
      for (const file of pendingFiles) {
        sendFile(file)
      }
    }

    console.log('Setting up connection', connectionIndex)
    setupConnection()

    return new Promise((resolve) => { res.once('close', resolve) })
  }

  const updateFile = (currentFile: File | undefined, fileParts: Partial<File>) => {
    if (!currentFile) return
    Object.assign(currentFile, fileParts)
    emitter.emit('file', currentFile)
    if (storedFiles.includes(currentFile))
      setFiles(storedFiles)
  }

  const handleFileUpdate = (fileParts: Partial<File>, id: string): File | undefined => {
    const currentFile = pendingFiles.find(f => f.id === id) ?? storedFiles.find(f => f.id === id)

    if (!currentFile) return
    updateFile(currentFile, fileParts)

    if (!iteration.done && !pendingFiles.includes(currentFile))
      emitter.once('done', () => updateFile(currentFile, fileParts))

    return currentFile
  }

  clearIteration()
  performUpdate()

  const pollFiles = () => {
    setTimeout(() => {
      handleUpdate()
      pollFiles()
    }, 60 * 1000)
  }
  
  pollFiles()

  return {
    handleUpdate,
    handleConnection,
    handleFileUpdate
  }
}

export const { 
  handleUpdate, 
  handleConnection, 
  handleFileUpdate 
} = constructFileUpdater()
