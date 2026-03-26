/** Dati istituzionali e SEO — personalizzare in produzione */

export const SITE_NAME = 'Grotta di Sale Roma'
export const SITE_NAME_SHORT = 'Grotta di Sale'

export function getSiteUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.grottadisale.it'
}

export const BUSINESS = {
  name: SITE_NAME,
  description:
    'Benessere respiratorio nella grotta di sale terapeutica nel cuore di Roma. Prenota la tua seduta.',
  telephone: '+39 06 0000 0000',
  email: 'info@grottadisale.it',
  streetAddress: 'Via Esempio 123',
  addressLocality: 'Roma',
  postalCode: '00100',
  addressCountry: 'IT',
  priceRange: '€€',
  /** Coordinate approssimative — aggiornare */
  geo: {
    latitude: 41.9028,
    longitude: 12.4964,
  },
  openingHoursSpecification: [
    {
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '20:00',
    },
  ],
  piva: 'XXXXXXXXXXX',
} as const

export function googleMapsUrl(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${BUSINESS.streetAddress}, ${BUSINESS.postalCode} ${BUSINESS.addressLocality}`,
    )}`
  )
}

export const SOCIAL = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/',
} as const
