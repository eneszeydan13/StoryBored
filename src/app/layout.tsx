import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { I18nProvider } from '@/lib/i18n/context';

export const metadata: Metadata = {
  title: 'StoryBoard - Post-it Development Board',
  description:
    'Visual, collaborative sticky-note storyboard for agile software development sprints and task management.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen font-sans bg-stone-100 dark:bg-[#0b0f19] text-stone-900 dark:text-stone-100 transition-colors duration-200 antialiased"
      >
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>{children}</AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
