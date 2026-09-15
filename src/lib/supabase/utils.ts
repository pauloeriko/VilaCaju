import type { BlockedDate } from './types'

// Convertit des plages de dates bloquées en tableau de dates individuelles YYYY-MM-DD
export function expandBlockedRanges(ranges: BlockedDate[]): string[] {
  const dates: string[] = []

  for (const range of ranges) {
    const [sy, sm, sd] = range.date_start.split('-').map(Number)
    const [ey, em, ed] = range.date_end.split('-').map(Number)
    const current = new Date(sy, sm - 1, sd)
    const end     = new Date(ey, em - 1, ed)

    while (current < end) {
      const y = current.getFullYear()
      const m = String(current.getMonth() + 1).padStart(2, '0')
      const d = String(current.getDate()).padStart(2, '0')
      dates.push(`${y}-${m}-${d}`)
      current.setDate(current.getDate() + 1)
    }
  }

  return dates
}
