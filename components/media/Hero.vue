<script setup lang="ts">
import type { Media, MediaType } from '~/types'
import { formatTime } from '~/composables/utils'

const { item, type = item?.media_type, to } = defineProps<{
  to: any,
  item: Media,
  type?: MediaType
}>()

const trailer = $computed(() => getTrailer(item))

const preferredReleaseLangs = useRuntimeConfig().public.ratingCountries.split(',')
const rating = $computed(() => {
  const ratings = new Map<string, string>()
  for (const result of item.release_dates?.results ?? []) {
    if (!preferredReleaseLangs.includes(result.iso_3166_1)) continue
    const cert = result.release_dates.find(date => date.certification)?.certification
    if (!cert) continue
    ratings.set(result.iso_3166_1, cert)
    if (ratings.size === preferredReleaseLangs.length) break
  }
  return ratings.get(preferredReleaseLangs.find(lang => ratings.get(lang)) ?? preferredReleaseLangs[0])
})

const showModal = useIframeModal()

function playTrailer() {
  if (trailer)
    showModal(trailer)
}

const mounted = useMounted()

const openEditModal = useEditModal()

const files = computed(() => getFiles(type, item.id))

</script>

<template>
  <div :key="item.id" relative isolate class="aspect-ratio-1/1 md:aspect-ratio-3/2 lg:aspect-ratio-25/9" bg-black>
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
    <NuxtLink v-if="to" absolute bottom-0 left-0 top-0 right-0 :to="to" z1 />
    <div
      absolute bottom-0 left-0 top-0 px-10
      flex="~ col" justify-center
      lt-lg="bg-gradient-to-t right-0 p10"
      lg="px25 w-2/3 bg-gradient-to-r"
      from-black via-black to-transparent
    >
      <Transition appear name="hero">
        <div v-show="mounted">
          <h1 class="title" mt-2 text-4xl lg:text-5xl line-clamp-2>
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
            <div v-if="rating" op50>
              {{ rating }}
            </div>            
          </div>
          <p mt-2 op80 leading-relaxed of-hidden line-clamp-3 md:line-clamp-5 text-xs md:text-base>
            {{ item.overview }}
          </p>
          <div flex="~ gap2" py5 z1 relative z2>
            <div v-if="files.length" flex gap2>
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
                @click.stop="openEditModal(item, type)"
              >
                <div i-ph-pencil />
              </button>
              <template v-if="trailer">
                <button
                  flex="~ gap2" items-center p="x4 y3 md:x6"
                  bg="gray/15 hover:gray/20" transition
                  title="Watch Trailer"
                  @click="playTrailer()"
                >
                  <div i-ph-film-strip />
                  <span display-none md:display-inline>
                    Trailer
                  </span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
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

.title {
  line-height: 1.5;
}
</style>
