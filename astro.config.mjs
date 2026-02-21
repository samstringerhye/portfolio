import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import rehypeLazyImages from './plugins/rehype-lazy-images.mjs'
import icon from 'astro-icon'
import fontSwitcher from './src/integrations/font-switcher'

export default defineConfig({
  site: 'https://samstringerhye.com',
  integrations: [react(), sitemap(), icon(), fontSwitcher()],
  markdown: {
    rehypePlugins: [rehypeLazyImages],
  },
  vite: {
    ssr: {
      noExternal: ['gsap'],
    },
    optimizeDeps: {
      include: ['react/jsx-dev-runtime', 'react/jsx-runtime'],
    },
  },
})