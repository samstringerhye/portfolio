import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import rehypeLazyImages from './plugins/rehype-lazy-images.mjs'

export default defineConfig({
  site: 'https://samstringerhye.com',
  integrations: [react(), sitemap()],
  markdown: {
    rehypePlugins: [rehypeLazyImages],
  },
  vite: {
    ssr: {
      noExternal: ['gsap'],
    },
  },
})
