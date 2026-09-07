import { notFound } from 'next/navigation';
import { ImmersiveSite } from '../../components/ImmersiveSite';
import { ClassicSite } from '../../components/ClassicSite';
import { pageKeys, pageTitles } from '../../../lib/content';
import { copy, translateText, type Locale } from '../../../lib/copy';
import { pagePath } from '../../../lib/paths';
const route = (slug: string[] = []) => {
  const locale: Locale = slug[0] === 'es-LA' ? 'es-LA' : 'en';
  return {
    locale,
    page: (locale === 'es-LA' ? slug.slice(1) : slug).join('/') || 'home',
  };
};
export async function generateStaticParams() {
  return ['classic', 'immersive'].flatMap((edition) =>
    (['en', 'es-LA'] as Locale[]).flatMap((locale) =>
      pageKeys.map((page) => ({
        edition,
        slug: [
          ...(locale === 'es-LA' ? ['es-LA'] : []),
          ...(page === 'home' ? [] : [page]),
        ],
      })),
    ),
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ edition: string; slug?: string[] }>;
}) {
  const { edition, slug = [] } = await params;
  const { locale, page } = route(slug);
  return {
    title: `${translateText(pageTitles[page] || 'Vessyl', locale)} — Vessyl`,
    description: copy('homeShort', locale),
    alternates: {
      languages: {
        en: pagePath(edition, page),
        'es-419': pagePath(edition, page, 'es-LA'),
      },
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ edition: string; slug?: string[] }>;
}) {
  const { edition, slug = [] } = await params;
  const { locale, page } = route(slug);
  if (!['classic', 'immersive'].includes(edition) || !pageKeys.includes(page))
    notFound();
  return edition === 'immersive' ? (
    <ImmersiveSite page={page} locale={locale} />
  ) : (
    <ClassicSite page={page} locale={locale} />
  );
}
