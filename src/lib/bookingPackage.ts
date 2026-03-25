/** Session storage: pacchetto scelto prima di aprire #prenotazione */

export const BOOKING_PACKAGE_STORAGE_KEY = 'salt-cave-selected-package'

export function setBookingPackageLabel(label: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(BOOKING_PACKAGE_STORAGE_KEY, label)
  } catch {
    /* ignore */
  }
}

export function getBookingPackageLabel(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(BOOKING_PACKAGE_STORAGE_KEY)
  } catch {
    return null
  }
}
