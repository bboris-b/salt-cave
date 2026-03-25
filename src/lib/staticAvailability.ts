/** Fasce orarie statiche — da sostituire con API / calendario reale */

export type TimeSlot = { id: string; label: string; available: boolean }

const BASE_SLOTS: Omit<TimeSlot, 'available'>[] = [
  { id: '10:00', label: '10:00' },
  { id: '11:00', label: '11:00' },
  { id: '14:30', label: '14:30' },
  { id: '16:00', label: '16:00' },
  { id: '17:30', label: '17:30' },
]

/**
 * Esempio: domenica 11:00 "esaurito"; giorni dispari del mese 16:00 esaurito.
 * Personalizzabile dal gestore.
 */
export function getTimeSlotsForDate(date: Date): TimeSlot[] {
  const day = date.getDay()
  const dom = date.getDate()

  return BASE_SLOTS.map((s) => {
    let available = true
    if (day === 0 && s.id === '11:00') available = false
    if (dom % 2 === 1 && s.id === '16:00') available = false
    if (day === 3 && s.id === '17:30') available = false
    return { ...s, available }
  })
}
