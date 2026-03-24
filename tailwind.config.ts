import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        'page-bg': '#f9f7f2',
        'footer-bg': '#f9f7f2',
        /** NasuNest ロゴ #4a6a60 に調和するテキスト・アクセント */
        nasu: {
          DEFAULT: '#4a6a60',
          950: '#1a2321',
          900: '#243530',
          800: '#2f403b',
          700: '#3d524c',
          600: '#4a6a60',
          500: '#5c726b',
          400: '#758a83',
        },
      },
    },
  },
}
