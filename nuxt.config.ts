const isDev = process.env.NODE_ENV === 'development'

const apiBaseUrl = process.env.NUXT_PUBLIC_PROXY_URL

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxt/image-edge',
  ],
  experimental: {
    reactivityTransform: true,
    inlineSSRStyles: false,
  },
  routeRules: {
    '/**': isDev ? {} : { cache: { swr: true, maxAge: 120, staleMaxAge: 60, headersOnly: true } },
  },
  runtimeConfig: {
    public: {
      apiBaseUrl,
      proxy: {
        url: ''
      },
      worker: {
        url: ''
      }
    },
  },
  image: {
    provider: 'proxy',
    providers: {
      proxy: {
        provider: 'ipx',
        options: {
          baseURL: new URL('/ipx', apiBaseUrl).toString(),
        },
      },
    },
  },
})
