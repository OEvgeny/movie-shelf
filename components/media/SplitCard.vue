<script setup lang="ts">
import type { Media, MediaType } from '~/types'

const props = defineProps<{
  delay: number,
  items: Array<{
    type: MediaType
    result: Media
  }>
}>()

const activeSlide = ref(0)

onMounted(() => {
  let interval: NodeJS.Timeout
  setTimeout(() => {
    interval = setInterval(() => {
      activeSlide.value = (activeSlide.value + 1) % props.items.length
    }, 5000)
  }, props.delay ?? 0)
  onUnmounted(() => clearInterval(interval))
})

</script>

<template>
  <div class="split" inline-grid items-end place-items-center cursor-pointer>
    <template v-if="items?.length">
      <Transition name="slide" v-for="item, index of items" col-start-1 row-start-1 bg-black w-full>
        <MediaCard to="" v-if="index === activeSlide" :key="index" :type="item.type" :item="item.result" />
      </Transition>
    </template>
    <template v-else>
      <slot name="no-media" />
    </template>
  </div>
</template>

<style scoped>


.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease-out;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>