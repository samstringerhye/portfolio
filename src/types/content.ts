import type { HeadingTag, TextTag, TypographyRole, TypographyTag } from './typography'

export type ContentInset = 'sm' | 'md' | 'lg'

export interface HomeContent {
  hero: {
    headline: string
    headlineTag: HeadingTag
    headlineRole: TypographyRole
  }
  bio: {
    headline: string
    headlineTag: HeadingTag
    headlineRole: TypographyRole
    body: string
    bodyTag: TextTag
    bodyRole: TypographyRole
    contentInset?: ContentInset
  }
  work: {
    headline: string
    headingTag: HeadingTag
    headingRole: TypographyRole
    cardTitleTag: TypographyTag
    cardTitleRole: TypographyRole
    contentInset?: ContentInset
  }
  experience: ExperienceContent
  interests: {
    textRole: TypographyRole
    items: string[]
  }
}

export interface ExperienceJob {
  title: string
  company: string
  location: string
  startDate: string | null
  endDate: string | null
  highlights: string[]
}

export interface ExperienceContent {
  headline: string
  headingTag: HeadingTag
  jobTitleTag: HeadingTag
  companyTag: TextTag
  headingRole: TypographyRole
  jobTitleRole: TypographyRole
  companyRole: TypographyRole
  highlightRole: TypographyRole
  contentInset?: ContentInset
  jobs: ExperienceJob[]
}
