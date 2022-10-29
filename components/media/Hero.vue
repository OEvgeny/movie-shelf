<script setup lang="ts">
import type { Media, MediaType } from '~/types'
import { formatTime } from '~/composables/utils'

const { item, type = item?.media_type } = defineProps<{
  item: Media,
  type?: MediaType
}>()

const trailer = $computed(() => getTrailer(item))

const showModal = useIframeModal()
function playTrailer() {
  if (trailer)
    showModal(trailer)
}

const mounted = useMounted()

const files = computed(() => getFiles(type, item.id))
const filesRoot = computed(() => getFilesRoot(type, item.id))

const openImportModal = useImportModal()

</script>

<template>
  <div :key="item.id" relative class="aspect-ratio-1/1 md:aspect-ratio-3/2 lg:aspect-ratio-25/9" bg-black>
    <div
      absolute top-0 right-0
      lt-lg="left-0"
      lg="bottom-0 left-1/3"
    >
      <NuxtImg
        width="400"
        height="225"
        format="webp"
        :src="`/tmdb${item.backdrop_path}`"
        :alt="item.title || item.name"
        h-full w-full object-cover
      />
    </div>
    <div
      absolute bottom-0 left-0 top-0 px-10
      flex="~ col" justify-center
      lt-lg="bg-gradient-to-t right-0 p10"
      lg="px25 w-2/3 bg-gradient-to-r"
      from-black via-black to-transparent
    >
      <Transition appear name="hero">
        <div v-show="mounted">
          <h1 mt-2 text-4xl lg:text-5xl line-clamp-2>
            {{ item.title || item.name }}
          </h1>
          <div flex="~ row wrap" gap3 items-center mt4>
            <StarsRate w-25 :value="item.vote_average" />
            <div op50 hidden md:block>
              {{ item.vote_average }}
            </div>
            <div op50 hidden md:block>
              {{ item.vote_count }} Reviews
            </div>
            <div v-if="item.release_date" op50>
              {{ item.release_date.slice(0, 4) }}
            </div>
            <div v-if="item.runtime" op50>
              {{ formatTime(item.runtime) }}
            </div>
          </div>
          <p mt-2 op80 leading-relaxed of-hidden line-clamp-3 md:line-clamp-5 text-xs md:text-base>
            {{ item.overview }}
          </p>
          <div flex="~ gap2" py5>
            <div v-if="files" flex gap2>
              <button
                flex="~ gap2" items-center p="x6 y3"
                bg="lime/70 hover:lime/75" transition
                title="Watch"
                @click="downloadM3U(item, files)"
              >
                <div i-ph-play />
                Watch
              </button>
              <button
                order-last
                flex="~ gap2" items-center p="x4 y3"
                bg="transparent hover:gray/15" transition
                title="Edit"
                @click="openImportModal([{ type: item.media_type ?? type, result: item }], filesRoot)"
              >
                <div i-ph-pencil />
              </button>
              <div v-if="trailer" display-none lg:block>
                <button
                  flex="~ gap2" items-center p="x6 y3"
                  bg="gray/15 hover:gray/20" transition
                  title="Watch Trailer"
                  @click="playTrailer()"
                >
                  <div i-ph-film-strip />
                  Trailer
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <div v-if="trailer" lg:hidden absolute left-0 top-0 right-0 h="2/3" items-center justify-center>
      <button
        items-center p10 text-5xl op20 hover:op80 transition
        title="Watch Trailer"
        @click="playTrailer()"
      >
        <div i-ph-play-circle-light />
      </button>
    </div>
  </div>
</template>

<style>
.hero-enter-active,
.hero-leave-active {
  transition: transform .75s cubic-bezier(.4, .25, .3, 1), opacity .3s cubic-bezier(.4, .25, .3, 1);
}

.hero-enter-from,
.hero-leave-to {
  opacity: 0;
  transform: translate3d(0, 2rem, 0);
}

.hero-enter-to,
.hero-leave-from {
  opacity: 1;
  transform: translateZ(0);
}
</style>
