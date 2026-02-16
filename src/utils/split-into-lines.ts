/**
 * Splits a text element into visual line spans based on browser wrapping.
 * Measures word positions to detect natural line breaks, then replaces
 * the element's content with one <span> per visual line.
 */
export function splitIntoLines(el: HTMLElement, className: string): HTMLSpanElement[] {
  const text = el.textContent || ''
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return []

  // Clear and insert word spans for measurement (inline, visible)
  el.style.opacity = '0'
  el.innerHTML = ''

  // Insert words separated by text-node spaces so the browser wraps naturally
  const wordSpans: HTMLSpanElement[] = []
  words.forEach((word, i) => {
    if (i > 0) el.appendChild(document.createTextNode(' '))
    const span = document.createElement('span')
    span.style.display = 'inline'
    span.textContent = word
    el.appendChild(span)
    wordSpans.push(span)
  })

  // Group words by their vertical position (top of each word span)
  const lineGroups: string[][] = [[]]
  let prevTop = Math.round(wordSpans[0].getBoundingClientRect().top)

  wordSpans.forEach((span, i) => {
    const top = Math.round(span.getBoundingClientRect().top)
    if (top > prevTop + 2 && i > 0) {
      lineGroups.push([])
      prevTop = top
    }
    lineGroups[lineGroups.length - 1].push(words[i])
  })

  // Replace with line spans
  el.innerHTML = ''
  el.style.opacity = ''
  const lineEls: HTMLSpanElement[] = []
  lineGroups.forEach(lineWords => {
    const lineSpan = document.createElement('span')
    lineSpan.className = className
    lineSpan.textContent = lineWords.join(' ')
    el.appendChild(lineSpan)
    lineEls.push(lineSpan)
  })

  return lineEls
}
