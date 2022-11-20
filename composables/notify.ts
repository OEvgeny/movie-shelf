import { Media, Notification, NotificationPayload } from "~/types"

export const createNotificationsService = () => {
  const notifications = reactive<Map<string, NotificationPayload>>(new Map())

  function notify(key: string, message: Notification) {
    notifications.set(key, {
      key,
      message,
      when: Date.now(),
    })
  }

  function dismiss(key: string) {
    notifications.delete(key)
  }

  function dismissAll() {
    notifications.clear()
  }

  return reactive({
    notify,
    dismiss,
    dismissAll,
    pane: { isOpen: false },
    notifications: computed(() => Array.from(notifications.values()).sort((a, b) =>
      a.when < b.when ? 1 : a.when > b.when ? -1 : 0
    ))
  })
}
