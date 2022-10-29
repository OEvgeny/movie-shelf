import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  runtimeConfig: {
    worker: {
      proxyUrl: '',
      remoteFolderUrl: '',
    },
  },
  storage: {
    'db': {
      driver: 'fs',
      base: './data/db'
    }
  }
})
