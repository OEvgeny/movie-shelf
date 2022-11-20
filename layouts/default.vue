<script setup lang="ts">

const WaitProviders = defineComponent(async (_, ctx) => {
  await nextTick()
  return () => ctx.slots?.default?.()
})

const WaitConnection = defineComponent(async (_, ctx) => {
  await initConnection()
  return () => ctx.slots?.default?.()
})
</script>

<template>
  <div h-full w-full font-sans grid="~ lt-lg:rows-[1fr_max-content] lg:cols-[max-content_1fr]" of-hidden>
    <div of-x-hidden of-y-auto relative data-scroll>
      <WaitProviders #default>
        <WaitConnection #default>
          <slot />
        </WaitConnection>
      </WaitProviders>
      <NotificationPane />
    </div>
    <NavBar lg:order-first />
    <IframeModal />
    <PhotoModal />
    <ImportModal />
    <EditModal />
  </div>
</template>
