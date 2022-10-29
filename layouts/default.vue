<script setup lang="ts">

const AsyncWrapper = defineComponent(async (_, ctx) => {
  await Promise.resolve()
  return () => ctx.slots?.default?.()
})
</script>

<template>
  <div h-full w-full font-sans grid="~ lt-lg:rows-[1fr_max-content] lg:cols-[max-content_1fr]" of-hidden>
    <div of-x-hidden of-y-auto relative data-scroll>
      <AsyncWrapper #default>
        <slot />
      </AsyncWrapper>
    </div>
    <NavBar lg:order-first />
    <IframeModal />
    <PhotoModal />
    <ImportModal />
  </div>
</template>
