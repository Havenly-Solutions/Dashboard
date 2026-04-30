import type { Metadata } from 'next'
import { DM_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import LoadingScreen from '@/components/ui/LoadingScreen'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap', fallback: ['sans-serif'] })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap', fallback: ['sans-serif'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://dashboard.havenly.co.za'),
  title: 'Havenly Solutions Dashboard',
  description: 'Dashboard for Havenly Solutions',
  icons: { icon: '/favicon.ico' },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <LoadingScreen />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
