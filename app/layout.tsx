import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Helloria Creative Generator',
  description: 'Génération de creatives Meta par corridor',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
