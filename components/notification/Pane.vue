<script lang="ts" setup>

let isOpen = $ref<boolean>(false)

const { notifications, dismiss, dismissAll } = toRefs(provideNotifications(reactive({ isOpen: $$(isOpen) })))

</script>

<template>
  <Transition appear name="pane" isolate>
    <div class="pane" v-show="isOpen">
      <div absolute top-0 left-0 right-0 p1 bg-black:80 flex items-center gap2 z2>
        <div cursor-default pl4 text-lg>Notifications</div>
        <button
          p1 text-1xl n-link
          title="Dismiss all"
          @click="dismissAll()"
        >
          <div i-carbon-trash-can />
        </button>
        <button
          ml-auto
          p1 text-2xl n-link
          title="Close"
          @click="isOpen = false"
        >
          <div i-carbon-close />
        </button>
      </div>
      <ScrollArea pt12 py8 overflow-y-auto h-full>
        <TransitionGroup tag="div" name="pane" relative flex flex-col gap2>
          <NotificationCard
            v-for="notification of notifications"
            :key="`${notification.key}-${notification.message?.title}`"
            :message="notification.message" 
            :when="notification.when" 
            @click="dismiss(notification.key); isOpen = false"
            #actions
            px4
          >
            <button i-ph-trash p2 n-link @click="dismiss(notification.key)" />
          </NotificationCard>
        </TransitionGroup>
        <Transition appear name="pane">
          <template v-if="!notifications.length">
            <div text-white:40 py4 text-center cursor-default text-lg>No new notifications</div>
          </template>
        </Transition>
      </ScrollArea>
    </div>
  </Transition>
</template>

<style scoped>

.pane {
  --at-apply: w-full lg:w-100 h-full fixed top-0 bg-black:90 lg:border-r border-base ;
}

.pane-move,
.pane-enter-active,
.pane-leave-active {
  transition: transform .35s cubic-bezier(.4, .25, .3, 1), opacity .3s cubic-bezier(.4, .25, .3, 1);
}

.pane-enter-from,
.pane-leave-to {
  opacity: 0;
  transform: translate3d(-2rem, 0, 0);
}

.pane-enter-to,
.pane-leave-from {
  opacity: 1;
  transform: translateZ(0);
}

.pane-leave-active:not(.pane) {
  position: absolute;
  width: 100%;
}

</style>