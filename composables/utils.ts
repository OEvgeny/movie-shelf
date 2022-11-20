import LANGUAGES from '~/constants/languages'

export function formatDate(string: string) {
  const dateArray = string.split('-')
  const date = dateArray[2].slice(0, 1) === '0' ? dateArray[2].slice(1, 1) : dateArray[2]
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return `${date} ${months[+dateArray[1] - 1]} ${dateArray[0]}`
}

/**
 * Format minutes into hours and mins
 */
export function formatTime(minutes: number) {
  // seconds
  const seconds = minutes * 60
  let secondsLeft = seconds

  // hours
  const hours = Math.floor(secondsLeft / 3600)
  secondsLeft = secondsLeft % 3600

  // mins
  const mins = Math.floor(secondsLeft / 60)
  secondsLeft = secondsLeft % 60

  return `${hours ? `${hours}h` : ''} ${mins}min`
}

export function numberWithCommas(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatLang(iso: string) {
  const fullLang = LANGUAGES.find(lang => lang.iso_639_1 === iso)

  if (fullLang)
    return fullLang.english_name

  return iso
}

export function useSingleton<T>() {
  const key = Symbol('singleton')
  return [
    function provide(v: T) {
      const vm = getCurrentInstance()
      vm?.appContext.app.provide(key, v)
    },
    function use(fallback?: T) {
      return inject(key, fallback) as T
    },
  ] as const
}

export function downloadM3U(entry, files) {
  const title = entry.title ?? entry.name;
  const data = ['#EXTM3U', '']
  for (const file of files) {
    data.push(`#EXTINF:-1,${title} · ${file.name}`, file.url, '')
  }
  const blob = new File([data.join('\n')], `${title}.m3u`)
  const el = document.createElement('a')
  el.href = URL.createObjectURL(blob)
  el.download = `${title}.m3u`
  document.body.appendChild(el)
  el.click()   
  document.body.removeChild(el)
}

let config: any
export const getConfig = () => config
export const setConfig = (c: any) => (config = c)
