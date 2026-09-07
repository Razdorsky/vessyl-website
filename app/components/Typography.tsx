'use client';
import { useLocale } from './LocaleProvider';
import art from '../../lib/typography-art.json';
import type { CSSProperties } from 'react';
import { asset } from '../../lib/paths';
const catalog = art as Record<
  string,
  {
    desktop: string;
    mobile: string;
    desktopWidth: number;
    desktopHeight: number;
    mobileWidth: number;
    mobileHeight: number;
    responsive?: Record<
      'small' | 'medium' | 'large',
      { file: string; width: number; height: number }
    >;
  }
>;
export function Heading({
  text,
  as = 'h2',
  light = false,
  weight,
  align,
  visualStyle,
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'blockquote' | 'span';
  light?: boolean;
  weight?: 'regular' | 'bold';
  align?: 'center';
  visualStyle?: 'h2' | 'h3';
}) {
  const { t } = useLocale();
  text = t(text);
  const style =
    visualStyle ?? (as === 'blockquote' ? 'quote' : as === 'span' ? 'h2' : as);
  const variant =
    (style === 'h1' && weight ? `-${weight}` : '') +
    (align === 'center' ? '-center' : '');
  let hash = 2166136261;
  for (const char of style + variant + '|' + text)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  const entry = catalog[hash.toString(16)];
  const responsiveStyle = entry?.responsive
    ? ({
        '--heading-wide-image': `url("${asset('/typography/' + entry.desktop)}")`,
        '--heading-wide-ratio': `${entry.desktopWidth} / ${entry.desktopHeight}`,
        '--heading-wide-width': `${entry.desktopWidth}px`,
        ...Object.fromEntries(
          Object.entries(entry.responsive).flatMap(([size, variant]) => [
            [
              `--heading-${size}-image`,
              `url("${asset('/typography/' + variant.file)}")`,
            ],
            [`--heading-${size}-ratio`, `${variant.width} / ${variant.height}`],
            [`--heading-${size}-width`, `${variant.width}px`],
          ]),
        ),
      } as CSSProperties)
    : undefined;
  const Tag = as;
  return (
    <Tag
      className={`brand-heading brand-heading-${style} ${weight === 'regular' ? 'heading-regular' : ''} ${align === 'center' ? 'heading-centered' : ''} ${light ? 'heading-light' : ''} ${entry?.responsive ? 'heading-adaptive' : ''}`}
      data-heading={text}
    >
      {entry ? (
        <>
          <span className="sr-only">{text}</span>
          <picture
            className={entry.responsive ? 'heading-fallback' : undefined}
          >
            <source
              media="(max-width: 560px)"
              width={entry.mobileWidth}
              height={entry.mobileHeight}
              srcSet={asset('/typography/' + entry.mobile)}
            />
            <img
              src={asset('/typography/' + entry.desktop)}
              width={entry.desktopWidth}
              height={entry.desktopHeight}
              alt=""
              decoding="async"
              loading={entry.responsive ? 'lazy' : undefined}
            />
          </picture>
          {responsiveStyle && (
            <span
              aria-hidden="true"
              className="heading-responsive-art"
              style={responsiveStyle}
            />
          )}
        </>
      ) : (
        text
      )}
    </Tag>
  );
}
