import { FOOTER_FAQ_ITEMS } from '@/lib/footer-faq'
import { BUSINESS, getSiteUrl } from '@/lib/site-config'
import { getWhatsAppDigits } from '@/lib/whatsappBooking'

function localBusinessJsonLd(siteUrl: string) {
  const phoneDigits = getWhatsAppDigits()
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: BUSINESS.name,
    description:
      'Centro di haloterapia a Roma: grotta di sale, microclima controllato, benessere respiratorio.',
    url: siteUrl,
    image: `${siteUrl}/opengraph-image`,
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    },
    openingHoursSpecification: BUSINESS.openingHoursSpecification.map((spec) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: spec.dayOfWeek,
      opens: spec.opens,
      closes: spec.closes,
    })),
    sameAs: [
      process.env.NEXT_PUBLIC_INSTAGRAM_URL,
      process.env.NEXT_PUBLIC_FACEBOOK_URL,
      `https://wa.me/${phoneDigits}`,
    ].filter(Boolean),
  }
}

function faqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FOOTER_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function JsonLdScripts() {
  const siteUrl = getSiteUrl()
  const lb = localBusinessJsonLd(siteUrl)
  const faq = faqPageJsonLd()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  )
}
