<script lang="ts" setup>
import type { Notification } from '~/types'

const { message, when } = defineProps<{message: Notification, when?: number}>()

const ago = useTimeAgo(computed(() => new Date(when)))

</script>

<template>
  <div @click="message.action" cursor-pointer>
    <div flex items-center gap4>
      <div v-if="message.type === 'success'" flex-none w="3.5rem" i-ph-check-circle text-3xl text="lime/90"></div>
      <div v-else-if="message.media" bg-gray4:10 flex-none w="3.5rem" class="aspect-10/16">
        <NuxtImg
          v-if="message.media.poster_path"
          width="400"
          height="600"
          format="webp"
          :src="`/tmdb${message.media.poster_path}`"
          :alt="message.media.title || message.media.name"
          w-full h-full object-cover
        />
        <div v-else h-full op10 flex items-center content-center>
          <div i-ph:question ma text-2xl />
        </div>
      </div>
      <div>
        <div op95 text-lg v-if="message.title">{{ message.title }}</div>
        <div op50 v-if="message.subtitle">{{ message.subtitle }}</div>
        <template v-else-if="message.media">
          <div>
            {{ message.media.title || message.media.name }}
          </div>
          <div v-if="message.media.vote_average" flex text-sm gap-2 items-center>
            <StarsRate w-20 :value="message.media.vote_average" />
            <div op60>
              {{ message.media.vote_average }}
            </div>
          </div>
        </template>
      </div>
      <div @click.stop ml-auto text-xl><slot name="actions" /></div>
    </div>
    <div v-if="when" text-right op50 text-xs>{{ ago }}</div>
  </div>
</template>