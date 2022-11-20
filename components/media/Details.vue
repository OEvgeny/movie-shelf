<script setup lang="ts">
import type { Media, MediaType } from '~/types'

defineProps<{
  item: Media
  type: MediaType
}>()

const tab = $ref<'overview' | 'videos' | 'photos' | 'search'>('overview')
</script>

<template>
  <ScrollArea flex items-center justify-between px4 sm:justify-center gap2 lg:gap8 overflow-y-auto my6>
    <button n-tab :class="{ 'n-tab-active': tab === 'overview' }" @click="tab = 'overview'">
      Overview
    </button>
    <button n-tab :class="{ 'n-tab-active': tab === 'videos' }" @click="tab = 'videos'">
      Videos
    </button>
    <button n-tab :class="{ 'n-tab-active': tab === 'photos' }" @click="tab = 'photos'">
      Photos
    </button>
    <button n-tab :class="{ 'n-tab-active': tab === 'search' }" @click="tab = 'search'">
      Search
    </button>
  </ScrollArea>
  <MediaOverview v-if="tab === 'overview'" :item="item" :type="type" />
  <MediaVideos v-if="tab === 'videos'" :item="item" />
  <MediaPhotos v-if="tab === 'photos'" :item="item" />
  <MediaSearch v-if="tab === 'search'" :query="item.title ?? item.name" :show-adult="item.adult" />
</template>
