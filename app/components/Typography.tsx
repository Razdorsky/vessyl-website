import art from '../../lib/typography-art.json';
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
  }
>;
export function Heading({
  text,
  as = 'h2',
  light = false,
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'blockquote' | 'span';
  light?: boolean;
}) {
  const style = as === 'blockquote' ? 'quote' : as === 'span' ? 'h2' : as;
  let hash = 2166136261;
  for (const char of style + '|' + text)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  const entry = catalog[hash.toString(16)];
  const Tag = as;
  return (
    <Tag
      className={`brand-heading brand-heading-${style} ${light ? 'heading-light' : ''}`}
      data-heading={text}
    >
      {entry ? (
        <>
          <span className="sr-only">{text}</span>
          <picture>
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
            />
          </picture>
        </>
      ) : (
        text
      )}
    </Tag>
  );
}
