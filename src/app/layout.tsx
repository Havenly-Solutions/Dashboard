import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AppProviders } from '@/providers/AppProviders';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Havenly Solutions',
  description: 'Internal operations dashboard',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppProviders session={session}>
          {children}
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
