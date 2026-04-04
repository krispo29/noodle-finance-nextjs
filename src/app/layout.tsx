import type { Metadata } from 'next';
import { Sarabun, Prompt } from 'next/font/google';
import { ThemeProvider } from './ThemeProvider';
import Providers from './Providers';
import './globals.css';

// Thai fonts
const sarabun = Sarabun({
  weight: ['300', '400', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
  display: 'swap',
});

const prompt = Prompt({
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-prompt',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'บัญชีร้านก๋วยเตี๋ยว',
  description: 'ระบบบัญชีสำหรับร้านก๋วยเตี๋ยว',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${sarabun.variable} ${prompt.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
