import { defineConfig } from 'astro/config'
// import react from '@astrojs/react' // Removed: no React islands remain
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import remarkUnwrapImages from 'remark-unwrap-images'
import rehypeLazyImages from './plugins/rehype-lazy-images.mjs'
import icon from 'astro-icon'
import cloudflare from '@astrojs/cloudflare';
export default defineConfig({
  devToolbar: { enabled: false },
  site: 'https://samstringerhye.com',
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/404') }), icon()],

  image: {
    quality: 70,
  },

  build: {
    inlineStylesheets: 'always',
  },

  markdown: {
    remarkPlugins: [remarkUnwrapImages],
    rehypePlugins: [rehypeLazyImages],
  },

  vite: {
    ssr: {
      noExternal: ['gsap'],
    },
    optimizeDeps: {
      include: ['lottie-web/build/player/lottie_light'],
    },
  },

  adapter: cloudflare(),
})