export type Locale = 'fr' | 'nl' | 'en' | 'ar' | 'de' | 'pt' | 'es' | 'it'

export interface SendCountry {
  code: string
  name: string
  locales: Locale[]
  city: string
}

export interface ReceiveCountry {
  code: string
  name: string
  appearance: string
  extraLocales?: Locale[]
}

export const SEND_COUNTRIES: SendCountry[] = [
  { code: 'BE', name: 'Belgium',         locales: ['fr', 'nl'],      city: 'Brussels city center, Belgian architecture, tram visible' },
  { code: 'FR', name: 'France',          locales: ['fr'],            city: 'Paris street, Haussmann buildings, Parisian atmosphere' },
  { code: 'NL', name: 'Netherlands',     locales: ['nl'],            city: 'Amsterdam canal street, Dutch architecture, bicycles' },
  { code: 'DE', name: 'Germany',         locales: ['de'],            city: 'Berlin or Frankfurt city street, modern German architecture' },
  { code: 'GB', name: 'United Kingdom',  locales: ['en'],            city: 'London city street, British architecture, red bus visible' },
  { code: 'ES', name: 'Spain',           locales: ['es'],            city: 'Madrid or Barcelona city street, Spanish architecture' },
  { code: 'IT', name: 'Italy',           locales: ['it'],            city: 'Milan or Rome city street, Italian architecture' },
  { code: 'PT', name: 'Portugal',        locales: ['pt'],            city: 'Lisbon city street, Portuguese architecture, tram' },
  { code: 'FI', name: 'Finland',         locales: ['en'],            city: 'Helsinki city center, Nordic architecture, clean streets' },
]

export const RECEIVE_COUNTRIES: ReceiveCountry[] = [
  { code: 'MA', name: 'Morocco',            appearance: 'North African Moroccan',       extraLocales: ['ar'] },
  { code: 'TN', name: 'Tunisia',            appearance: 'North African Tunisian',       extraLocales: ['ar'] },
  { code: 'EG', name: 'Egypt',              appearance: 'North African Egyptian',       extraLocales: ['ar'] },
  { code: 'YE', name: 'Yemen',              appearance: 'Middle Eastern Yemeni',        extraLocales: ['ar'] },
  { code: 'AF', name: 'Afghanistan',        appearance: 'Afghan Central Asian' },
  { code: 'PK', name: 'Pakistan',           appearance: 'Pakistani South Asian' },
  { code: 'IN', name: 'India',              appearance: 'Indian South Asian' },
  { code: 'BD', name: 'Bangladesh',         appearance: 'Bangladeshi South Asian' },
  { code: 'GN', name: 'Guinea',             appearance: 'West African Guinean' },
  { code: 'SN', name: 'Senegal',            appearance: 'West African Senegalese' },
  { code: 'CO', name: 'Colombia',           appearance: 'Latin American Colombian' },
  { code: 'VE', name: 'Venezuela',          appearance: 'Latin American Venezuelan' },
  { code: 'DO', name: 'Dominican Republic', appearance: 'Caribbean Dominican' },
  { code: 'PE', name: 'Peru',               appearance: 'Latin American Peruvian' },
]

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  nl: 'Nederlands',
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
  pt: 'Português',
  es: 'Español',
  it: 'Italiano',
}

function currentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 8) return 'summer'
  if (m >= 9 && m <= 11) return 'autumn'
  return 'winter'
}

export const SEASON = currentSeason()

export function getSendCountry(code: string): SendCountry | undefined {
  return SEND_COUNTRIES.find(c => c.code === code)
}

export function getReceiveCountry(code: string): ReceiveCountry | undefined {
  return RECEIVE_COUNTRIES.find(c => c.code === code)
}

export function getLocalesForCorridor(send: string, receive: string): Locale[] {
  const s = getSendCountry(send)
  const r = getReceiveCountry(receive)
  if (!s || !r) return ['en']
  const extra = r.extraLocales ?? []
  return [...new Set([...s.locales, ...extra])]
}
