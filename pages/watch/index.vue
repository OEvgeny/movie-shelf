<script setup lang="ts">

definePageMeta({
  key: route => route.fullPath,
})

useHead({
  title: 'Watch movies & TV Shows',
})

const queries = computed(() => [
  { title: 'Movies', type: 'movie', items: movies.items },
  { title: 'TV Shows', type: 'tv', items: shows.items },
  { title: 'Import', type: null, items: imports.items, files: imports.files },
])

const firstMovie = computed(() => movies.items?.[0])

const AsyncWrapper = defineComponent(async (_, ctx) => {
  const item = await getMedia('movie', firstMovie.value.id)
  return () => ctx.slots?.default?.({ item })
})

const openImportModal = useImportModal()

await initConnection()
</script>

<template>
  <div>
    <AsyncWrapper v-if="firstMovie" #default="{ item }">
      <NuxtLink :to="`/movie/${item.id}`">
        <MediaHero :item="item" type="movie" />
      </NuxtLink>
    </AsyncWrapper>
    <template
      v-for="query of queries"
      :key="query.type"
    >
      <template v-if="query.items.length">
        <div flex py3 px10 items-center mt5>
          <div text-2xl>
            {{ query.title }}
          </div>
        </div>
        <MediaGrid py2>
          <MediaCard
            v-if="query.type"
            v-for="item of query.items"
            :key="item.id"
            :type="query.type"
            :item="item"
          />
          <MediaSplitCard
            v-else
            v-for="items, index of query.items"
            :delay="index * 100"
            @click="openImportModal(items, query.files[index])"
            :items="items"
          />
        </MediaGrid>
      </template>
    </template>
    <TheFooter />
  </div>
</template>
