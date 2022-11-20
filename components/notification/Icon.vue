<script lang="ts" setup>
import type { NotificationPayload } from '~/types'

const { pane, notifications } = toRefs(useNotifications())

let lastNotification = $ref<NotificationPayload>()

let showNotification = $ref<boolean>(false)

const setLastNotification = () => {
  const notification = notifications.value[0]
  if (!notification || notification.when < Date.now() - 10000) {
    lastNotification = undefined
    return
  }
  if (notification.key !== lastNotification?.key) {
    showNotification = true
  }
  lastNotification = notification
  if (showNotification) {
    setTimeout(() => {
      if (lastNotification === notification) showNotification = false
    }, 10000)
  }
}

watch(notifications, setLastNotification, { deep: true })
setLastNotification()

</script>

<template>
  <div flex items-center flex-col-reverse relative lg:flex-row>
    <div
      text-2xl cursor-pointer
      :class="pane.isOpen ? 'i-ph-bell-fill text-primary' : 'i-ph-bell'"
      @click.stop="pane.isOpen = !pane.isOpen"
    />
    <Transition appear name="notification">
      <div 
        :key="`${lastNotification.key}-${lastNotification.message?.title}`"
        v-if="lastNotification?.message" 
        v-show="!pane.isOpen && showNotification"
        relative w-0 h-0 
      >
        <div class="notification" flex flex-col justify-center>
          <button
            absolute top-1 right-1 p1 text-2xl n-link
            title="Close"
            @click="lastNotification = undefined"
          >
            <div i-carbon-close />
          </button>
          <NotificationCard :message="lastNotification.message" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>

.notification {
  --anchor-size: 10px;
  --inner-space: 1rem;
  --at-apply: cursor-pointer absolute w-100 min-h-25 overflow-hidden bg-black:90;
  margin-left: 1.5rem;
  margin-bottom: 1.5rem;
  max-width: calc(100vw - 1.5rem * 2);
  bottom: 100%;
  transform: translateX(-100%);
  padding: var(--inner-space) var(--inner-space) calc(var(--anchor-size) + var(--inner-space)) var(--inner-space);
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--anchor-size)), calc(100% - 15px) calc(100% - var(--anchor-size)), calc(100% - 25px) 100%, calc(100% - 35px) calc(100% - var(--anchor-size)), 0 calc(100% - var(--anchor-size)));
}

@media screen and (min-width: 1024px) {
  .notification {
    bottom: unset;
    left: 100%;
    transform: translateY(-50%);
    padding: var(--inner-space) var(--inner-space) var(--inner-space) calc(var(--anchor-size) + var(--inner-space));
    clip-path: polygon(var(--anchor-size) 0, 100% 0, 100% 100%, var(--anchor-size) 100%, var(--anchor-size) calc(50% - var(--anchor-size)), 0% 50%, var(--anchor-size) calc(50% + var(--anchor-size)));
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: transform .35s cubic-bezier(.4, .25, .3, 1), opacity .3s cubic-bezier(.4, .25, .3, 1);
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translate3d(-2rem, 0, 0);
}

.notification-enter-to,
.notification-leave-from {
  opacity: 1;
  transform: translateZ(0);
}


</style>