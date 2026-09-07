import { notFound } from 'next/navigation';
import { ImmersiveSite } from '../../components/ImmersiveSite';
import { ClassicSite } from '../../components/ClassicSite';
import { pageKeys, pageTitles } from '../../../lib/content';
export async function generateStaticParams() {
  return ['classic', 'immersive'].flatMap((edition) =>
    pageKeys.map((page) => ({ edition, slug: page === 'home' ? [] : [page] })),
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ edition: string; slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const page = slug.join('/') || 'home';
  return { title: `${pageTitles[page] || 'Vessyl'} — Vessyl` };
}
export default async function Page({
  params,
}: {
  params: Promise<{ edition: string; slug?: string[] }>;
}) {
  const { edition, slug = [] } = await params;
  const page = slug.join('/') || 'home';
  if (!['classic', 'immersive'].includes(edition) || !pageKeys.includes(page))
    notFound();
  return edition === 'immersive' ? (
    <ImmersiveSite page={page} />
  ) : (
    <ClassicSite page={page} />
  );
}
