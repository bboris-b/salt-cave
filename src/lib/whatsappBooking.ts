function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '')
}

/** wa.me richiede il numero con prefisso paese, senza + */
export function getWhatsAppDigits(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? ''
  const d = digitsOnly(raw)
  return d.length >= 8 ? d : '390000000000'
}

export function buildBookingWhatsAppUrl(payload: {
  name: string
  dateLabel: string
  timeLabel: string
  people: number
  packageLabel: string
}): string {
  const text = `Ciao! Vorrei prenotare una seduta per ${payload.name}, ${payload.dateLabel} alle ${payload.timeLabel}, ${payload.people} ${payload.people === 1 ? 'persona' : 'persone'}. Pacchetto: ${payload.packageLabel}.`
  const phone = getWhatsAppDigits()
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}
