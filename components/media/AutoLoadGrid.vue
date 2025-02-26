<script setup lang="ts">
import type { Media, MediaType } from '~/types'

const props = defineProps<{
  items: Media[]
  type: MediaType
  fetch: (page: number) => Promise<void>
  count?: number
}>()

const tailEl = ref<HTMLDivElement>()

let page = 0
let isLoading = $ref(false)

async function loadingNext() {
  if (isLoading)
    return
  isLoading = true
  try {
    page += 1
    await props.fetch(page)
  }
  finally {
    isLoading = false
  }
}

if (process.client) {
  loadingNext()
  useIntervalFn(() => {
    if (!tailEl.value || isLoading)
      return
    if (props.count != null && props.items.length >= props.count)
      return
    const { top } = tailEl.value.getBoundingClientRect()
    const delta = top - window.innerHeight
    if (delta < 400)
      loadingNext()
  }, 500)
}
else {
  await loadingNext()
}
</script>

<template>
  <div>
    <h1 flex="~" px8 pt8 gap2 text-3xl>
      <slot />
    </h1>
    <div v-if="count != null" px8 op50>
      {{ count }} items
    </div>
    <MediaGrid>
      <template v-for="item of items">
        <slot name="item" v-bind="{ item }">
          <MediaCard
            :key="item.id"
            :type="type"
            :item="item"
          />
        </slot>
      </template>
    </MediaGrid>
    <div ref="tailEl" />
    <div v-if="isLoading" flex items-center justify-center p10>
      <Loader />
    </div>
  </div>
</template>
