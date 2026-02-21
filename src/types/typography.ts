export const TYPOGRAPHY_ROLES = [
  'prose-title-lg',
  'prose-title-sm',
  'prose-heading-lg',
  'prose-heading-sm',
  'prose-subhead-lg',
  'prose-subhead-sm',
  'prose-body',
  'prose-mono',
  'prose-code-block',
  'prose-blockquote',
  'prose-list',
  'ui-button-lg',
  'ui-button-sm',
  'ui-nav-item-lg',
  'ui-nav-item-sm',
  'ui-nav-section',
  'ui-nav-badge',
] as const

export type TypographyRole = (typeof TYPOGRAPHY_ROLES)[number]

export const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
export type HeadingTag = (typeof HEADING_TAGS)[number]

export const TEXT_TAGS = ['p', 'span', 'div'] as const
export type TextTag = (typeof TEXT_TAGS)[number]

export type TypographyTag = HeadingTag | TextTag
