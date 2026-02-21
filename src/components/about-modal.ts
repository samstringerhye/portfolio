type AboutWindow = Window & {
  __aboutAfterSwapHandler?: () => void
}

type AboutModalElement = HTMLElement & {
  __aboutKeydownHandler?: (e: KeyboardEvent) => void
}

function initAboutModal() {
  const modal = document.getElementById('about-modal') as AboutModalElement | null
  if (!modal) return

  const content = modal.querySelector('.about-content') as HTMLElement | null
  const triggers = document.querySelectorAll('[data-about-trigger]')
  const closers = modal.querySelectorAll('[data-about-close]')

  let previousFocus: HTMLElement | null = null

  function open() {
    previousFocus = document.activeElement as HTMLElement
    modal!.hidden = false

    // Prevent layout shift from scrollbar disappearance
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    content?.focus()
  }

  function close() {
    modal!.hidden = true
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    previousFocus?.focus()
  }

  triggers.forEach(t => {
    const trigger = t as HTMLElement
    if (trigger.dataset.aboutTriggerBound === 'true') return
    trigger.dataset.aboutTriggerBound = 'true'
    trigger.addEventListener('click', open)
  })

  closers.forEach(c => {
    const closer = c as HTMLElement
    if (closer.dataset.aboutCloserBound === 'true') return
    closer.dataset.aboutCloserBound = 'true'
    closer.addEventListener('click', close)
  })

  // Escape key + focus trap
  if (modal.__aboutKeydownHandler) {
    modal.removeEventListener('keydown', modal.__aboutKeydownHandler)
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close()
      return
    }

    if (e.key === 'Tab') {
      const focusable = modal!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
  }

  modal.__aboutKeydownHandler = handleKeydown
  modal.addEventListener('keydown', handleKeydown)
}

const aboutWindow = window as AboutWindow
if (aboutWindow.__aboutAfterSwapHandler) {
  document.removeEventListener('astro:after-swap', aboutWindow.__aboutAfterSwapHandler)
}
aboutWindow.__aboutAfterSwapHandler = initAboutModal

initAboutModal()
document.addEventListener('astro:after-swap', aboutWindow.__aboutAfterSwapHandler)
