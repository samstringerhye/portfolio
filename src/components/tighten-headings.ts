/**
 * Tighten line-height on single-line headings for better visual density.
 * Checks if the element's content fits within one line and reduces line-height to 1.
 */
export function tightenSingleLineHeadings(selector: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const style = getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight)
    const contentHeight = el.scrollHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
    if (contentHeight <= lineHeight * 1.1) {
      el.style.lineHeight = '1'
    }
  })
}
