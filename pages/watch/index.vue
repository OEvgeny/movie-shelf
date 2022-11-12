<script setup lang="ts">
import { Media, MediaType } from '~~/types';

definePageMeta({
  key: route => route.fullPath,
})

useHead({
  title: 'Watch movies & TV Shows',
})

const route = useRoute()
const router = useRouter()

const moviesItems = computed(() => {
  switch(route.query.movie) {
    case 'kids': return kidsMovies.items
    case 'adult': return adultMovies.items
    default: return movies.items
  }
})

const queries = computed(() => [
  { title: 'Movies', type: 'movie' as MediaType, items: moviesItems.value },
  { title: 'TV Shows', type: 'tv' as MediaType, items: shows.items },
  { title: 'Import', type: null, items: imports.items, files: imports.files },
])

const firstMovie = computed(() => moviesItems.value?.[0])

const AsyncWrapper = defineComponent({
  props: {
    id: String
  },
  setup: async (props, ctx) => {
    const getFirstMovieDetails = () => getMedia('movie', props.id!)

    const item = ref<Media>(await getFirstMovieDetails())
    watch(props, async () => {
      item.value = await getFirstMovieDetails()
    }, { deep: true })

    return () => ctx.slots?.default?.({ item: item.value })
  }
})

const openImportModal = useImportModal()

const handleTabSwitch = (type = '') => {
  router.push({
    query: { movie: type }
  })
}

await initConnection()
</script>

<template>
  <div>
    <AsyncWrapper v-if="firstMovie?.id" :id="firstMovie.id" #default="{ item }">
      <NuxtLink :to="`/movie/${item.id}`">
        <MediaHero :item="item" type="movie" />
      </NuxtLink>
    </AsyncWrapper>
    <template
      v-for="query of queries"
      :key="query.type"
    >
      <template v-if="query.items.length || query.type === 'movie'">
        <div flex py3 px10 items-center mt5>
          <div text-2xl>
            {{ query.title }}
          </div>
          <template v-if="query.type === 'movie'">
            <div ml-auto @click="handleTabSwitch($event.target?.dataset.value)">
              <button 
                data-value="kids"
                :class="{ active: route.query.movie === 'kids'}"
                class="toggle-button"
              >
                Kids
              </button>
              <button 
                data-value=""
                :class="{ active: !route.query.movie}"
                class="toggle-button"
              >
                All
              </button>
              <button 
                data-value="adult"
                :class="{ active: route.query.movie === 'adult'}"
                class="toggle-button"
              >
                Adult
              </button>
            </div>
          </template>
        </div>
        <template v-if="query.items.length">
          <MediaGrid py2>
            <MediaCard
              v-if="query.type"
              v-for="item of query.items as Media[]"
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
              #no-media
            >
              <MediaCard class="capitalize-title" to="" :item="{ title: query.files[index]?.search?.query }" />
            </MediaSplitCard>
          </MediaGrid>
        </template>
        <template v-else>
          <div text-3xl p10 font-100 op50 text-center>
            Nothing here
          </div>
        </template>
      </template>
    </template>
    <TheFooter />
  </div>
</template>

<style scoped>

.toggle-button {
  --at-apply: text-center items-center px3 py1 bg-gray/10 hover:bg-primary transition
}

.toggle-button.active {
  --at-apply: bg-primary/80 hover:bg-primary/80;
}

.capitalize-title:deep(.title) {
  text-transform: capitalize;
}
</style>