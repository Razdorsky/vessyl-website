import './globals.css';
import './motion.css';
import './classic-spacing.css';
import './immersive.css';
import './localization.css';
import './photography.css';
import { PageMotion } from './components/PageMotion';
import { asset } from '../lib/paths';
import { copy } from '../lib/copy';
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <PageMotion />
        {children}
      </body>
    </html>
  );
}
