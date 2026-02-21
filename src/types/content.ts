import type { HeadingTag, TextTag, TypographyRole } from './typography'

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
  }
  work: {
    headline: string
    headingTag: HeadingTag
    headingRole: TypographyRole
    cardTitleTag: HeadingTag
    cardTitleRole: TypographyRole
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
  jobs: ExperienceJob[]
}
