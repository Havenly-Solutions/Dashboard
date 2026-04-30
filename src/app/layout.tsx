import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AppProviders } from '@/providers/AppProviders';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Havenly Solutions',
  description: 'Internal operations dashboard',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pass the server session to AppProviders so NextAuth
  // doesn't make an extra network call on the client
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders session={session}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
