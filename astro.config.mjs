import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import remarkUnwrapImages from 'remark-unwrap-images'
import rehypeLazyImages from './plugins/rehype-lazy-images.mjs'
import icon from 'astro-icon'
export default defineConfig({
  devToolbar: { enabled: false },
  site: 'https://samstringerhye.com',
  integrations: [react(), mdx(), sitemap(), icon()],
  markdown: {
    remarkPlugins: [remarkUnwrapImages],
    rehypePlugins: [rehypeLazyImages],
  },
  vite: {
    ssr: {
      noExternal: ['gsap'],
    },
    optimizeDeps: {
      include: ['react/jsx-dev-runtime', 'react/jsx-runtime', 'lottie-web/build/player/lottie_light.min.js'],
    },
  },
})