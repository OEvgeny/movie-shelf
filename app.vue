<script setup>
import '@unocss/reset/tailwind.css'

setConfig(useRuntimeConfig())

useHead({
  htmlAttrs: {
    lang: 'en',
  },
  charset: 'utf-8',
  title: 'Movie Shelf',
  titleTemplate: title => title !== 'Movie Shelf' ? `${title} · Movie Shelf` : title,
  meta: [
    { name: 'description', content: 'A personal movie management app ✨' },
    { property: 'og:image', content: '/movies.webp' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    {
      rel: 'icon', type: 'image/webp', href: '/movies.webp',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtLoadingIndicator
      color="repeating-linear-gradient(to right,#93002d 0%,#dc0043 50%,#e60014 100%)"
    />
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html, body , #__nuxt{
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #111;
  color: white;
  color-scheme: dark;
  -webkit-tap-highlight-color: #dc004366;
}

::selection {
  --at-apply: bg-primary/65;
}

</style>
