'use client';
import { asset } from '../../lib/paths';
import { useLocale } from './LocaleProvider';
import imageAlts from '../../lib/image-alts.json';
import spanishAlts from '../../lib/locales/es-LA-images.json';
import imageDimensions from '../../lib/image-dimensions.json';
import { photoMetadata } from '../../lib/classic-photography';
const picture = (id: string, small = false) =>
  asset(`/images/${id}${small ? '-thumb' : ''}.webp`);
// Descriptive image alternatives are interface accessibility copy, not marketing prose.

export function Photo({
  id,
  alt = '',
  className = '',
  eager = false,
  sizes,
}: {
  id: string;
  alt?: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  const { locale } = useLocale();
  const dimensions = imageDimensions[id as keyof typeof imageDimensions];
  const metadata = photoMetadata(id);
  const englishAlt =
    metadata?.alt || (imageAlts as Record<string, string>)[id] || alt;
  const imageAlt =
    locale === 'es-LA'
      ? (spanishAlts as Record<string, string>)[englishAlt] || alt
      : englishAlt;
  return (
    <img
      className={className}
      data-photo-id={id}
      style={metadata ? { objectPosition: metadata.objectPosition } : undefined}
      src={picture(id)}
      srcSet={
        dimensions?.thumbnailWidth &&
        dimensions.thumbnailWidth < dimensions.width
          ? `${picture(id, true)} ${dimensions.thumbnailWidth}w, ${picture(id)} ${dimensions.width}w`
          : undefined
      }
      width={dimensions?.width}
      height={dimensions?.height}
      sizes={
        sizes ??
        (eager
          ? '100vw'
          : '(max-width: 560px) 100vw, (max-width: 1000px) 60vw, 50vw')
      }
      alt={alt ? imageAlt : ''}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
    />
  );
}
