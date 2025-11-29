// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            'page-bg': '#f9f7f2',
          },
        },
      },
    },
  },
  fonts: {
    families: [
      {
        name: 'Shippori Mincho',
        provider: 'google',
        weights: [400, 600, 700, 800],
      },
      {
        name: 'Kosugi Maru',
        provider: 'google',
        weights: [400, 700],
      },
      {
        name: 'Caveat',
        provider: 'google',
        weights: [400, 500, 600, 700],
      },
    ],
  },
})
