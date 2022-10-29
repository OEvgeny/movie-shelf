<script lang="ts" setup>

const { query } = defineProps<{
  query?: string
}>()

let count = $ref<undefined | number>()
const input = $ref<string>(query ?? '')

let items = $ref<any[]>([])
let currentSearch = $ref<string>()

const getSortPredicate = (field) => (a, b) => {
  const fieldA = a[field]
  const fieldB = b[field]
  return fieldA > fieldB
    ? -1
    : fieldA < fieldB
    ? 1
    : 0
}

async function fetch(page: number) {
  if (!currentSearch)
    return
  const data = await searchProwlarr(currentSearch)
  count = data.length ?? count
  data
    .sort(getSortPredicate('size'))
    .sort(getSortPredicate('seeders'))
  items.push(...data)
}

function search() {
  if (currentSearch === input)
    return
  currentSearch = input
  count = undefined
  items = []
  fetch(1)
}

const throttledSearch = useDebounceFn(search, 500)

watch(
  () => input,
  () => throttledSearch(),
)

throttledSearch()


const save = async (item: any) => {
  const { guid, indexerId } = item
  await saveToProwlarr({guid, indexerId })
  item.saved = true
}

function humanFileSize(bytes, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

function getCategories (categories: any[]) {
  return categories?.map(c => c.name).filter(c => c).join(', ')
}

</script>

<template>
  <div flex="~ col" px16 py8 gap6>
    <div flex bg-gray:10 items-center px6 py4 gap3 sticky>
      <div i-ph:magnifying-glass text-xl op50 />
      <input
        v-model="input"
        type="text"          
        text-2xl bg-transparent outline-none flex-auto
        placeholder="Type to search..."
        @keyup.enter="search"
      >
    </div>
    <table class="zebra" v-if="items.length" tex-center w-full overflow-hidden>
      <thead>
        <th>Title</th>
        <th>Age</th>
        <th>Source</th>
        <th>Category</th>
        <th>Size</th>
        <th>Peers</th>
        <th></th>
      </thead>
      <tbody>
        <tr text-center v-for="item of items" :class="{ 'opacity-50': item.seeders === 0 }">
          <td text-left min-w-80 max-w-100><a :href="item.infoUrl" n-link target="_blank" rel="nofollow,noopener">{{ item.title }}</a></td>
          <td>{{ item.age }} days</td>
          <td>{{ item.indexer }}</td>
          <td>{{ getCategories(item.categories) }}</td>
          <td>{{ humanFileSize(item.size) }}</td>
          <td>{{ item.seeders }} / {{ item.leechers }}</td>
          <td>
            <button v-if="!item.saved" n-link @click="save(item)">
              <div i-ph-cloud-arrow-up />
            </button>
            <div v-else text-lime i-ph-cloud-check />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

td, th {
  @apply px6 py3;
}

.zebra th, .zebra tr:nth-child(2n) td {
  @apply bg-primary/10;
}

.zebra tr:nth-child(2n+1) td {
  @apply bg-primary/5;
}

</style>