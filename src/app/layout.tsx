import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import LoadingScreen from '@/components/ui/LoadingScreen'

export const metadata: Metadata = {
  metadataBase: new URL('https://dashboard.havenly.co.za'),
  title: 'Havenly Solutions Command Centre',
  description: 'Guardian Command Centre — The Black Sheep Tech Corp LTD (PTY)',
  icons: { icon: '/favicon.ico' },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <LoadingScreen />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
