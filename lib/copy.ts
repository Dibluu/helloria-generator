import type { Locale } from './corridors'

interface Copy {
  prefix: string
  suffix?: string
  subheadline: string
}

const COPY: Record<Locale, (country: string) => Copy> = {
  fr: (country) => ({
    prefix: 'Envoi de fonds en ',
    subheadline: `Avec un taux exclusif sur votre premier transfert`,
  }),
  nl: (country) => ({
    prefix: 'Geld naar ',
    suffix: ' verzenden',
    subheadline: 'Met een extra speciaal tarief voor uw eerste overboeking',
  }),
  en: (country) => ({
    prefix: 'Send money to ',
    subheadline: 'With an exclusive rate on your first transfer',
  }),
  ar: (country) => ({
    prefix: 'أرسل المال إلى ',
    subheadline: 'بسعر حصري على أول تحويل لك',
  }),
  de: (country) => ({
    prefix: 'Geld nach ',
    suffix: ' senden',
    subheadline: 'Mit Sondertarif für Ihren ersten Transfer',
  }),
}

export function getCopy(locale: Locale, country: string): Copy {
  return (COPY[locale] ?? COPY.fr)(country)
}
