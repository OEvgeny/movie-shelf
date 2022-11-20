<script setup lang="ts">
import { onKeyDown } from '@vueuse/core'
import type { Media, File, MediaType } from '~~/types';

let media = $ref<Media | null>(null)
let type = $ref<MediaType | null>(null)

provideEditModal((m, t) => {
  media = m
  type = t
})

onKeyDown('Escape', () => {
  media = null
})

const filesRoots = $computed(() => getFilesRoots(type, media.id))

let tab = $ref<'files'>('files')

watch($$(media), () => tab = 'files')

const openImportModal = useImportModal()


const handleDelete = (file: File) => {
  updateFile(file, { isDeleted: true, tmdbId: media?.id, type: type })
  media = null
}
</script>

<template>
  <div v-if="media" fixed top-0 left-0 right-0 bottom-0 z-10 bg-black:90 flex>
    <button
      absolute top-1 right-1 z-100 p3 text-3xl n-link bg-black:60 rounded-full
      title="Close"
      @click="media = null"
    >
      <div i-carbon-close />
    </button>
    <div flex flex-col gap4 w-full p8 of-auto data-scroll>
      <div flex py3 px8 items-center mt5>
        <div text-2xl>
          Edit {{ media.title ?? media.name }}
        </div>
      </div>
      <div flex items-center justify-center gap8 py6>
        <button n-tab :class="{ 'n-tab-active': tab === 'files' }" @click="tab = 'files'">
          Files
        </button>
      </div>
      <template v-if="tab === 'files'">
        <div px8 v-for="dir of filesRoots">
          <div flex flex-col gap4 pb4>
            <div text-2xl break-all>
              {{ dir.name }}
            </div>
            <div flex gap2 items-center>
              <button
                flex="~ gap2" items-center p="x4 y2"
                bg="primary/70 primary:lime/75" transition
                title="Import"
                @click="openImportModal([], dir); media = null"
              >
                <div i-ph-arrow-square-down />
                Import
              </button>
              <button
                flex="~ gap2" items-center p="x4 y2"
                bg="gray/15 hover:gray/20" transition
                title="Delete"
                @click="handleDelete(dir)"
              >
                <div i-ph-trash />
                Delete
              </button>
            </div>
          </div>
          <div px2 break-all text="white/60" v-for="file of dir?.files?.files">{{ file.name }}</div>
        </div>
      </template>
    </div>
  </div>
</template>
