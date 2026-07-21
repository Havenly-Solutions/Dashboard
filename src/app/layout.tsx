import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { PostHogProviderWrapper } from "@/lib/posthog-provider";

export const metadata: Metadata = {
  title: "Havenly Solutions | Dashboard",
  description: "Havenly Solutions \u2014 SOS operations, helpdesk, customer support, and growth analytics.",
  icons: { icon: "/havenly-logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <PostHogProviderWrapper>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <ToastProvider>{children}</ToastProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </PostHogProviderWrapper>
      </body>
    </html>
  );
}
