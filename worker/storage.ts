import { EventEmitter } from 'node:events';

const emitter = new EventEmitter()

export const getFiles = async () => await useStorage().getItem('db:files') || []

export const setFiles = async (updatedFiles: any[]) => {
  const storedFiles = await getFiles()
  const files = []
  for (const file of updatedFiles) {
    const index = storedFiles.findIndex(item => item.id === file.id)
    if (index !== -1) {
      storedFiles[index] = { ...storedFiles[index],  ...file }
      files.push(storedFiles[index])
    } else {
      throw new Error('Not found')
    }
  }
  await useStorage().setItem('db:files', storedFiles)
  emitter.emit('files', files)
}

export const subscribe = (cb) => {
  emitter.on('files', cb)
  return () => emitter.off('files', cb)
}