import type { AstroIntegration } from 'astro'

export default function fontSwitcherIntegration(): AstroIntegration {
  return {
    name: 'font-switcher',
    hooks: {
      'astro:config:setup': ({ addDevToolbarApp }) => {
        addDevToolbarApp({
          id: 'font-switcher',
          name: 'Font Switcher',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 13L4.5 3h2l3 10h-1.8l-.7-2.5h-3L3.3 13H1.5zM5.2 9h2.1L6.25 5.2h-.1L5.2 9zM12 3h4v1.5h-1.2V13H13.3V4.5H12V3z"/></svg>',
          entrypoint: new URL('./font-switcher-app.ts', import.meta.url),
        })
      },
    },
  }
}
