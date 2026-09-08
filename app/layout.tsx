import './globals.css';
import './motion.css';
import './classic-spacing.css';
import './immersive.css';
import './localization.css';
import './photography.css';
import './classic-typography.css';
import { PageMotion } from './components/PageMotion';
import { asset } from '../lib/paths';
import { copy } from '../lib/copy';
import { headerColors } from '../lib/header-theme';
import type { CSSProperties } from 'react';
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: headerColors.dark,
};
export const metadata = {
  icons: { icon: asset('/favicon.svg') },
  title: copy('home'),
  description: copy('homeShort'),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={
        {
          '--header-dark': headerColors.dark,
          '--header-warm': headerColors.warm,
        } as CSSProperties
      }
    >
      <body>
        <PageMotion />
        {children}
      </body>
    </html>
  );
}
