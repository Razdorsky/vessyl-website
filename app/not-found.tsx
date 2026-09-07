'use client';
import { usePathname } from 'next/navigation';
import { asset, pagePath } from '../lib/paths';
import { copy } from '../lib/copy';
import { LocaleProvider } from './components/LocaleProvider';
import { Heading } from './components/Typography';
export default function NotFound() {
  const pathname = usePathname() || '';
  const locale = pathname.split('/').includes('es-LA') ? 'es-LA' : 'en';
  const edition = pathname.split('/').includes('immersive')
    ? 'immersive'
    : 'classic';
  const home = pagePath(edition, 'home', locale);
  return (
    <LocaleProvider locale={locale}>
      <main className="not-found-page">
        <a href={home} aria-label={copy('ui.homeLink', locale)}>
          <img src={asset('/brand/logo-white.svg')} alt="Vessyl" width="190" />
        </a>
        <span className="eyebrow light">404</span>
        <Heading as="h1" text={copy('ui.notFound', locale)} light />
        <a className="button cream" href={home}>
          {copy('home', locale)}
        </a>
      </main>
    </LocaleProvider>
  );
}
