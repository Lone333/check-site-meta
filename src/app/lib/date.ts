const dateFormat = {
  mediumDate: { dateStyle: 'medium' },
  shortTime: { timeStyle: 'short' },
  mediumDateShortTime: { dateStyle: 'medium', timeStyle: 'short' },
} satisfies Record<string, Intl.DateTimeFormatOptions>

export function formatDate(date?: string | number | Date, preset: keyof typeof dateFormat = 'mediumDate') {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', dateFormat[preset]).format(new Date(date))
}
