import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  routeRules: {
    '/tmdb/**': { swr: 3600 },
  },
  runtimeConfig: {
    tmdb: {
      url: 'https://api.themoviedb.org',
      lang: 'en-US',
      apiKey: '',
    },
    prowlarr: {
      url: '',
      apiKey: '',
    }
  },
})
