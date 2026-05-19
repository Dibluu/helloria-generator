import type { Locale } from './corridors'

interface Copy {
  prefix: string
  suffix?: string
  subheadline: string
}

const COPY: Record<Locale, (country: string) => Copy> = {
  fr: () => ({
    prefix: 'Envoi de fonds en ',
    subheadline: 'Avec un taux exclusif sur votre premier transfert',
  }),
  nl: () => ({
    prefix: 'Geld naar ',
    suffix: ' verzenden',
    subheadline: 'Met een extra speciaal tarief voor uw eerste overboeking',
  }),
  en: () => ({
    prefix: 'Send money to ',
    subheadline: 'With an exclusive rate on your first transfer',
  }),
  ar: () => ({
    prefix: 'أرسل المال إلى ',
    subheadline: 'بسعر حصري على أول تحويل لك',
  }),
  de: () => ({
    prefix: 'Geld nach ',
    suffix: ' senden',
    subheadline: 'Mit Sondertarif für Ihren ersten Transfer',
  }),
  pt: () => ({
    prefix: 'Enviar dinheiro para ',
    subheadline: 'Com uma taxa exclusiva na sua primeira transferência',
  }),
  es: () => ({
    prefix: 'Envía dinero a ',
    subheadline: 'Con una tasa exclusiva en tu primera transferencia',
  }),
  it: () => ({
    prefix: 'Invia denaro in ',
    subheadline: 'Con un tasso esclusivo al tuo primo trasferimento',
  }),
  tr: () => ({
    prefix: "Para gönder ",
    subheadline: 'İlk transferinde özel bir kur avantajıyla',
  }),
  hi: () => ({
    prefix: 'पैसे भेजें ',
    subheadline: 'पहले ट्रांसफर पर एक्सक्लूसिव रेट के साथ',
  }),
  ur: () => ({
    prefix: 'پیسے بھیجیں ',
    subheadline: 'پہلی منتقلی پر خصوصی شرح کے ساتھ',
  }),
  bn: () => ({
    prefix: 'টাকা পাঠান ',
    subheadline: 'প্রথম ট্রান্সফারে এক্সক্লুসিভ রেটে',
  }),
  pl: () => ({
    prefix: 'Wyślij pieniądze do ',
    subheadline: 'Z ekskluzywnym kursem na pierwszy przelew',
  }),
  ro: () => ({
    prefix: 'Trimite bani în ',
    subheadline: 'Cu un curs exclusiv la primul tău transfer',
  }),
  sw: () => ({
    prefix: 'Tuma pesa ',
    subheadline: 'Kwa kiwango cha kipekee kwenye uhamisho wako wa kwanza',
  }),
}

export function getCopy(locale: Locale, country: string): Copy {
  return (COPY[locale] ?? COPY.en)(country)
}
