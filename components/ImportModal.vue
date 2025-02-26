<script setup lang="ts">
import { onKeyDown } from '@vueuse/core'
import type { Media, File, FileTMDBMedia } from '~~/types';

const router = useRouter()

let suggestions = $ref<FileTMDBMedia[] | null>(null)
let file = $ref<File | null>(null)

provideImportModal((s, f) => {
  suggestions = s
  file = f
})

onKeyDown('Escape', () => {
  file = null
})


let tab = $ref<'search' | 'suggestions'>('search')

watch($$(file), () => tab = suggestions?.length ?  'suggestions' : 'search')

const processImport = (entry: FileTMDBMedia) => {
  if (!file) return
  updateFile(file, { tmdbId: entry.result.id, type: entry.type })
  router.push(`/${entry.type}/${entry.result.id}`)
  file = null
}

let count = $ref<undefined | number>()
let input = $ref<string>()

let items = $ref<Media[]>([])
let currentSearch = $ref(input)

watchEffect(() => {
  if (file?.search.query) input = file.search.query ?? ''
})

function search() {
  if (currentSearch === input)
    return
  currentSearch = input
  count = undefined
  items = []
}

async function fetch(page: number) {
  if (!currentSearch)
    return
  const data = await searchShows(currentSearch, page)
  count = data.total_results ?? count
  items.push(...data.results)
}

const throttledSearch = useDebounceFn(search, 200)

watch(
  () => input,
  () => throttledSearch(),
)
</script>

<template>
  <div v-if="file" fixed top-0 left-0 right-0 bottom-0 z-10 bg-black:90 flex>
    <button
      absolute top-1 right-1 z-100 p3 text-3xl n-link bg-black:60 rounded-full
      title="Close"
      @click="file = null"
    >
      <div i-carbon-close />
    </button>
    <div flex flex-col gap8 w-full p8 of-auto data-scroll>
      <div flex py3 px10 items-center mt5>
        <div text-2xl break-all>
          Import {{ file.name.replace('/', '') }}
        </div>
      </div>
      <div flex items-center justify-center gap8 py6>
        <button n-tab :class="{ 'n-tab-active': tab === 'suggestions' }" @click="tab = 'suggestions'">
          Suggestions
        </button>
        <button n-tab :class="{ 'n-tab-active': tab === 'search' }" @click="tab = 'search'">
          Search
        </button>
      </div>
      <template v-if="tab === 'suggestions'" >
        <MediaGrid w-full>
          <MediaCard @click="processImport(item)" v-for="item of suggestions" to="" :type="item.type" :item="item.result" cursor-pointer />
        </MediaGrid>
      </template>
      <template v-else-if="tab === 'search'">
        <div flex bg-gray:10 items-center px4 md:px6 py4 gap3 sticky>
          <div i-ph:magnifying-glass text-xl op50 />
          <input
            v-model="input"
            type="text"          
            text-2xl bg-transparent outline-none flex-auto
            placeholder="Type to search..."
            @keyup.enter="search"
          >
        </div>
        <MediaAutoLoadGrid
          v-if="currentSearch"
          :key="currentSearch"
          :fetch="fetch"
          :items="items"
          :count="count"
          type="movie"
        >
          <template #item="{ item }">
            <MediaCard
              @click="processImport({ type: item.media_type ?? 'movie', result: item })"
              :key="item.id"
              :item="item"
              :type="item.media_type ?? 'movie'"
              to=""
              cursor-pointer
            />
          </template>
          <div>Search result for: {{ currentSearch }}</div>
        </MediaAutoLoadGrid>
        <div v-else text-4xl p4 md:p10 font-100 op50 text-center>
          Type something to search...
        </div>
      </template>
    </div>
  </div>
</template>
