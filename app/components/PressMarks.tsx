'use client';
import { asset } from '../../lib/paths';
import { useLocale } from './LocaleProvider';
const marks = [
  ['wallpaper.svg', 'Wallpaper*', 100, 23],
  ['forbes.svg', 'Forbes Travel Guide', 100, 29],
  ['nyt.png', 'The New York Times', 119, 20],
  ['dwell.png', 'Dwell', 61, 26],
  ['people.png', 'People Inc.', 100, 23],
  ['fast-company.svg', 'Fast Company', 100, 15],
  ['dow-jones.svg', 'Dow Jones Reprints & Licensing', 88, 37],
  ['skimm.png', 'theSkimm', 70, 36],
] as const;
export function PressMarks() {
  const { c: copy } = useLocale();
  return (
    <section className="press-marks" aria-label={copy('asSeenIn')}>
      <p className="eyebrow">{copy('asSeenIn')}</p>
      <div>
        {marks.map(([file, name, width, height]) => (
          <img
            key={file}
            src={asset('/press/logos/' + file)}
            alt={name}
            width={width}
            height={height}
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
