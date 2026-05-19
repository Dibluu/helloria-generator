export type Locale = 'fr' | 'nl' | 'en' | 'ar' | 'de'

export interface Corridor {
  send: string
  sendName: string
  receive: string
  receiveName: string
  locales: Locale[]
  season: 'spring' | 'summer' | 'autumn' | 'winter'
}

function currentSeason(): Corridor['season'] {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

const SEASON = currentSeason()

export const CORRIDORS: Corridor[] = [
  { send: 'BE', sendName: 'Belgique', receive: 'MA', receiveName: 'Maroc', locales: ['fr', 'nl', 'ar'], season: SEASON },
  { send: 'BE', sendName: 'Belgique', receive: 'TN', receiveName: 'Tunisie', locales: ['fr', 'nl', 'ar'], season: SEASON },
  { send: 'BE', sendName: 'Belgique', receive: 'AF', receiveName: 'Afghanistan', locales: ['fr', 'nl'], season: SEASON },
  { send: 'BE', sendName: 'Belgique', receive: 'TR', receiveName: 'Turquie', locales: ['fr', 'nl'], season: SEASON },
  { send: 'BE', sendName: 'Belgique', receive: 'CD', receiveName: 'Congo', locales: ['fr'], season: SEASON },
  { send: 'NL', sendName: 'Pays-Bas', receive: 'MA', receiveName: 'Maroc', locales: ['nl', 'ar'], season: SEASON },
  { send: 'NL', sendName: 'Pays-Bas', receive: 'TR', receiveName: 'Turquie', locales: ['nl'], season: SEASON },
  { send: 'FR', sendName: 'France', receive: 'MA', receiveName: 'Maroc', locales: ['fr', 'ar'], season: SEASON },
  { send: 'FR', sendName: 'France', receive: 'TN', receiveName: 'Tunisie', locales: ['fr', 'ar'], season: SEASON },
  { send: 'FR', sendName: 'France', receive: 'AF', receiveName: 'Afghanistan', locales: ['fr'], season: SEASON },
]

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  nl: 'Nederlands',
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
}

export function getCorridor(send: string, receive: string): Corridor | undefined {
  return CORRIDORS.find(c => c.send === send && c.receive === receive)
}
