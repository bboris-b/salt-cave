export const routes = {
  home: '/',
  esperienza: '/esperienza',
  haloterapia: '/haloterapia',
  servizi: '/servizi',
  prenota: '/prenota',
  contatti: '/contatti',
  privacy: '/privacy',
  cookiePolicy: '/cookie-policy',
  termini: '/termini',
} as const

/** Voci menu principale: logo + questi path */
export const MAIN_NAV = [
  { href: routes.haloterapia, label: "L'haloterapia" },
  { href: routes.servizi, label: 'Servizi' },
  { href: routes.prenota, label: 'Prenota' },
  { href: routes.contatti, label: 'Contatti' },
] as const
