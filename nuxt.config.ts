// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title:
        'NasuNest - 那須町の人がつながるきっかけを生み出す地域コミュニティプラットフォーム',
      titleTemplate: '%s | NasuNest',
      htmlAttrs: {
        lang: 'ja',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'NasuNestは、栃木県那須町の「人がつながるきっかけ」を生み出す地域コミュニティプラットフォーム。イベント・体験・交流会を簡単に探して参加できます。',
        },
        {
          name: 'keywords',
          content:
            '那須町,地域おこし協力隊,イベント,コミュニティ,移住,地域活動,ワークショップ,交流会,NasuNest',
        },
        { name: 'format-detection', content: 'telephone=no' },
        // OGP
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'NasuNest' },
        {
          property: 'og:title',
          content:
            'NasuNest - 那須町の人がつながるきっかけを生み出す地域コミュニティプラットフォーム',
        },
        {
          property: 'og:description',
          content:
            'NasuNestは、栃木県那須町の「人がつながるきっかけ」を生み出す地域コミュニティプラットフォーム。イベント・体験・交流会を簡単に探して参加できます。',
        },
        { property: 'og:url', content: 'https://www.nasunest.com' },
        {
          property: 'og:image',
          content: 'https://www.nasunest.com/img/title-logo.png',
        },
        { property: 'og:locale', content: 'ja_JP' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content:
            'NasuNest - 那須町の人がつながるきっかけを生み出す地域コミュニティプラットフォーム',
        },
        {
          name: 'twitter:description',
          content:
            'NasuNestは、栃木県那須町の「人がつながるきっかけ」を生み出す地域コミュニティプラットフォーム。イベント・体験・交流会を簡単に探して参加できます。',
        },
        {
          name: 'twitter:image',
          content: 'https://www.nasunest.com/img/title-logo.png',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://www.nasunest.com' },
      ],
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
