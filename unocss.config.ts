import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

// @unocss-include

export default defineConfig({
  shortcuts: [
    ['n-link', 'op50 hover:(op100 text-primary) transition'],
    ['n-link-text', 'n-link underline'],
    ['n-tab', 'text-base lg:text-xl tracking-wide uppercase p3 border-b-2 border-transparent op20 transition'],
    ['n-tab-active', 'border-current op100'],
    ['border-base', 'border-gray-400/20'],
  ],
  theme: {
    colors: {
      primary: '#dc0043',
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
