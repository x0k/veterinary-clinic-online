import type { PropsWithChildren } from 'react'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import '@/styles/globals.css'

import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Ветеринарная клиника',
  description: 'Учебная ветеринарная клиника АЙБОЛИТ',
}

export default function RootLayout({
  children,
}: PropsWithChildren): JSX.Element {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
