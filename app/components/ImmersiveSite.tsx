'use client';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { SiteNavigation } from './SiteNavigation';
import { Heading } from './Typography';
import { PressMarks } from './PressMarks';
import { Photo, Pattern, FaqList, Gallery, LinkArrow } from './SitePrimitives';
import { EditorialFilm } from './EditorialFilm';
import { type CopyKey, type Locale } from '../../lib/copy';
import { LocaleProvider, useLocale } from './LocaleProvider';
import { journeys, containedChapter } from '../../lib/journeys';
import { BOOKING, EMAIL, WAITLIST, getContent } from '../../lib/content';
import { classicPhoto as photo } from '../../lib/classic-photography';
import { asset, pagePath } from '../../lib/paths';
import { AutoHeight, Disclosure } from './MotionPrimitives';
import { journeyPosition } from '../../lib/journey-position';
const ScrollWorld = lazy(() => import('./ScrollWorld'));
const selections: Record<string, string[]> = {
  dome: ['yoga-nidra', 'fractals', 'voices'],
  hearth: ['breathwork', 'vibrational-yoga', 'qi-chai'],
  app: ['quantum-self', 'chakra', 'breathwork', 'vibrational-yoga'],
};
function SessionLibrary({ page }: { page: string }) {
  const { c, locale } = useLocale();
  const { practices } = getContent(locale);
  const [filter, setFilter] = useState(
    page === 'quantum' ? 'Quantum' : page === 'wellness' ? 'Wellness' : 'All',
  );
  const [opened, setOpened] = useState<string | null>(null);
  const catalog = !selections[page];
  return (
    <section className="journey-library journey-section" id="session-library">
      <div className="journey-section-title">
        <Heading
          as={catalog ? 'h3' : 'h2'}
          text={c(
            catalog
              ? 'choiceIntro'
              : page === 'dome'
                ? 'domeSession'
                : 'sessions',
          )}
          align="center"
        />
      </div>
      {catalog && (
        <div className="journey-filters" aria-label={c('sessions')}>
          {['All', 'Wellness', 'Quantum'].map((f) => (
            <button
              key={f}
              aria-pressed={f === filter}
              onClick={() => {
                setFilter(f);
                setOpened(null);
              }}
            >
              {c(
                f === 'All'
                  ? 'ui.all'
                  : f === 'Quantum'
                    ? 'ui.quantumCategory'
                    : 'ui.wellnessCategory',
              )}
            </button>
          ))}
        </div>
      )}
      <AutoHeight>
        <div className="journey-session-list" key={filter}>
          {practices
            .filter((p) =>
              selections[page]
                ? selections[page].includes(p.id)
                : filter === 'All' || p.category === filter,
            )
            .map((p) => (
              <article className="journey-session" key={p.id}>
                <button
                  aria-expanded={opened === p.id}
                  aria-controls={'practice-' + p.id}
                  onClick={() => setOpened(opened === p.id ? null : p.id)}
                >
                  <Photo id={photo(page, `practice:${p.id}`, p.image)} />
                  <span>
                    <small>
                      {c(
                        p.category === 'Quantum'
                          ? 'ui.quantumCategory'
                          : 'ui.wellnessCategory',
                      )}
                    </small>
                    <Heading as="h3" text={p.title} />
                  </span>
                  <Plus aria-hidden="true" />
                </button>
                <Disclosure open={opened === p.id} id={'practice-' + p.id}>
                  <div className="journey-session-body">
                    <p>
                      {page === 'quantum' && p.id === 'quantum-self'
                        ? c('quantumMethods')
                        : p.body}
                    </p>
                    <LinkArrow
                      href={`mailto:${EMAIL}?subject=${encodeURIComponent(c('personalBook') + ': ' + p.title)}`}
                      button
                    >
                      {c('personalBook')}
                    </LinkArrow>
                  </div>
                </Disclosure>
              </article>
            ))}
        </div>
      </AutoHeight>
    </section>
  );
}
function TwoDoors() {
  const { c, locale } = useLocale();
  const url = (page = 'home') => pagePath('immersive', page, locale);
  return (
    <section className="journey-two-doors journey-section pattern-panel">
      <Pattern tone="forest" />
      <Heading text={c('twoDoors')} light align="center" />
      <p>{c('twoDoorsIntro')}</p>
      <div className="journey-door-options">
        <div>
          <span>{c('inPerson')}</span>
          <Heading as="h3" text={c('stayCostaRica')} light />
          <LinkArrow href={BOOKING} button light external>
            {c('bookStay')}
          </LinkArrow>
        </div>
        <div>
          <span>{c('fromAnywhere')}</span>
          <Heading as="h3" text={c('sessionsPocket')} light />
          <LinkArrow href={url('app')} button light>
            {c('downloadTheApp')}
          </LinkArrow>
        </div>
      </div>
    </section>
  );
}
export function ImmersiveSite({
  page,
  locale = 'en',
}: {
  page: string;
  locale?: Locale;
}) {
  return (
    <LocaleProvider locale={locale}>
      <ImmersivePage page={page} />
    </LocaleProvider>
  );
}
function ImmersivePage({ page }: { page: string }) {
  const { c, locale } = useLocale();
  const { pageTitles, faqs } = getContent(locale);
  const url = (page = 'home', edition = 'immersive') =>
    pagePath(edition, page, locale);
  const chapters = journeys[page];
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [reduced, setReduced] = useState<boolean | null>(null);
  const utility = ['press', 'contact', 'faq'].includes(page);
  const staticWorld = failed || reduced === true || utility;
  const onReady = useCallback(() => setReady(true), []),
    onFailure = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const track = el.querySelector<HTMLElement>('.journey-track');
      if (!track) return;
      const { bounds, progress } = journeyPosition(track);
      const index = Math.min(chapters.length - 1, Math.floor(progress + 0.15));
      el.dataset.inJourney = String(
        !staticWorld && bounds.bottom > innerHeight * 0.35,
      );
      el.querySelectorAll<HTMLElement>('.journey-chapter').forEach(
        (section, i) => {
          const local = progress - i;
          const fade = staticWorld
            ? 1
            : Math.max(0, Math.min(1, (0.94 - local) * 6));
          section.style.setProperty('--chapter-opacity', String(fade));
          if (i === index) {
            const copy = section.querySelector<HTMLElement>('.journey-copy');
            el.style.setProperty(
              '--copy-scrim-end',
              `${Math.min(innerHeight - 32, Math.max(innerHeight * 0.48, (copy?.getBoundingClientRect().bottom || 0) + 16))}px`,
            );
          }
        },
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    el.querySelectorAll('.journey-copy').forEach((copy) =>
      observer.observe(copy),
    );
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [chapters, staticWorld]);
  const prose = (key: CopyKey) => (
    <p key={key} data-copy={key}>
      {c(key).trim()}
    </p>
  );
  const editorial = (
    title: CopyKey,
    body: CopyKey[],
    as: 'h2' | 'h3' = 'h2',
  ) => (
    <section className="journey-section journey-editorial">
      <Heading as={as} text={c(title)} align="center" />
      <div>{body.map(prose)}</div>
    </section>
  );
  const quote = (key: CopyKey, copper = false) => (
    <section
      className={`journey-quote journey-section pattern-panel ${copper ? 'journey-quote-copper' : ''}`}
    >
      <Pattern tone={copper ? 'copper' : 'paper'} />
      <Heading as="blockquote" text={c(key)} align="center" light={copper} />
      <span className="quote-author">{c('quoteAuthor')}</span>
    </section>
  );
  const facilitatorBlock = [
    'home',
    'experience',
    'hearth',
    'sessions',
    'quantum',
    'wellness',
    'app',
  ].includes(page);
  const hasTwoDoors = ['home', 'experience'].includes(page);
  return (
    <div
      ref={root}
      className={`site immersive-journey ${ready ? 'world-ready' : ''} ${staticWorld ? 'world-failed' : ''} ${utility ? 'journey-utility' : ''}`}
      data-page={page}
      data-locale={locale}
      lang={locale === 'es-LA' ? 'es-419' : 'en'}
      data-in-journey={!staticWorld}
      data-renderer="independent-scroll-world"
    >
      <a className="skip-link" href="#content">
        {c('ui.skip')}
      </a>
      <SiteNavigation edition="immersive" page={page} />
      {!staticWorld && (
        <div className="journey-stage" aria-hidden="true">
          <Photo
            id={chapters[0].image}
            className={`journey-poster ${containedChapter(chapters[0]) ? 'poster-contained' : ''}`}
            alt=""
            eager
          />
          {reduced === false && (
            <Suspense fallback={null}>
              <ScrollWorld
                chapters={chapters}
                paused={false}
                onReady={onReady}
                onFailure={onFailure}
              />
            </Suspense>
          )}
          <div className="journey-scrim" />
        </div>
      )}
      <main id="content">
        <div className="journey-track">
          {chapters.map((chapter, i) => {
            const contained = containedChapter(chapter);
            const marks = chapter.image === 'founder';
            return (
              <section
                key={i}
                className={`journey-chapter chapter-${chapter.world} ${contained ? 'chapter-contained' : 'chapter-panorama'} ${chapter.image === 'dome-design-direction' ? 'chapter-dome-exterior' : ''} ${i === 0 ? 'chapter-first' : ''} ${chapter.heading === 'h3' ? 'chapter-statement' : ''}`}
                id={'chapter-' + i}
                data-journey-chapter={i}
                tabIndex={-1}
              >
                <div className="journey-copy">
                  {chapter.title === 'dome' && (
                    <img
                      className="journey-dome-mark"
                      src={asset('/brand/dome-symbol.svg')}
                      width="70"
                      height="70"
                      alt=""
                      aria-hidden="true"
                    />
                  )}
                  <Heading
                    as={i === 0 ? 'h1' : (chapter.heading ?? 'h2')}
                    weight={i === 0 ? 'bold' : undefined}
                    text={c(chapter.title)}
                    light
                    align={contained && i !== 0 ? undefined : 'center'}
                  />
                  <div className="chapter-prose">{chapter.body.map(prose)}</div>
                  {chapter.to && chapter.to !== page && (
                    <LinkArrow href={url(chapter.to)} light button>
                      {c(chapter.action || 'learn')}
                    </LinkArrow>
                  )}
                  {marks && <PressMarks />}
                  {(contained || chapter.image === 'dome-design-direction') && (
                    <Photo
                      id={chapter.image}
                      className="chapter-mobile-photo"
                      eager={i === 0}
                    />
                  )}
                </div>
                {(!ready || staticWorld) && !utility && (
                  <Photo
                    id={chapter.image}
                    className="chapter-fallback"
                    alt=""
                    eager={i === 0}
                  />
                )}
              </section>
            );
          })}
        </div>
        <div className="journey-details" id="journey-details">
          {page === 'founder' && (
            <>
              {editorial(
                'founderExplorationIntro',
                [
                  'founderExplorationQuestion',
                  'founderNext',
                  'founderDestination',
                ],
                'h3',
              )}
              <EditorialFilm name="founder" />
              {quote('founderQuote')}
            </>
          )}
          {page === 'home' && quote('quote', true)}
          {page === 'nature' && editorial('park', ['destinationIntro'])}
          {page === 'rancho' &&
            editorial('rancho', ['tableIntro', 'ranchoRitual'])}
          {page === 'stay' &&
            editorial('arrival', [
              'locationIntro',
              'travelSjo',
              'travelLir',
              'flights',
            ])}
          {page === 'app' && (
            <>
              <section className="journey-section journey-store">
                <div>
                  <button
                    className="button"
                    disabled
                    title={c('ui.notConnected')}
                  >
                    {c('appStore')}
                  </button>
                  <button
                    className="button"
                    disabled
                    title={c('ui.notConnected')}
                  >
                    {c('googlePlay')}
                  </button>
                  <LinkArrow href={WAITLIST}>{c('ui.waitlist')}</LinkArrow>
                </div>
              </section>
              {editorial('appLibrary', ['appLibraryIntro'])}
              {editorial('appGuides', ['appGuidesIntro'])}
            </>
          )}
          {[
            'sessions',
            'quantum',
            'wellness',
            'app',
            'dome',
            'hearth',
          ].includes(page) && <SessionLibrary page={page} />}
          {page === 'music' && <EditorialFilm name="music" />}
          {page === 'sessions' && <EditorialFilm name="sessions" />}
          {facilitatorBlock && (
            <section
              className={`journey-facilitators journey-section ${page === 'experience' ? 'pattern-panel' : ''}`}
            >
              {page === 'experience' && <Pattern tone="paper" variant="fans" />}
              <Photo
                id={photo(
                  page,
                  ['sessions', 'quantum', 'wellness'].includes(page)
                    ? 'story:facilitators'
                    : 'facilitators-cta',
                  'session',
                )}
              />
              <div>
                <Heading text={c('guidesCta')} />
                {prose(
                  ['sessions', 'wellness'].includes(page)
                    ? 'guidesExpertiseIntro'
                    : 'guidesIntro',
                )}
                <LinkArrow href={url('facilitators')} button>
                  {c('learn')}
                </LinkArrow>
              </div>
            </section>
          )}
          {page === 'experience' && (
            <section className="journey-facilitators journey-section">
              <Photo id={photo(page, 'story:music', 'dome-interior')} />
              <div>
                <Heading text={c('music')} />
                {prose('musicIntro')}
                <LinkArrow href={url('music')} button>
                  {c('musicCta')}
                </LinkArrow>
              </div>
            </section>
          )}
          {['stay', 'rancho', 'dome', 'hearth'].includes(page) && (
            <Gallery
              images={[0, 1, 2].map((index) => ({
                id: photo(page, `gallery:${index}`, 'nature'),
                caption: c(
                  (page === 'stay'
                    ? ['rooms', 'roomConcept', 'hospitality']
                    : page === 'rancho'
                      ? ['culinary', 'rancho', 'hospitality']
                      : page === 'dome'
                        ? ['dome', 'domeSession', 'studio']
                        : ['hearth', 'waterfalls', 'wellness'])[
                    index
                  ] as CopyKey,
                ),
              }))}
            />
          )}
          {page === 'dome' && (
            <>
              {editorial('studio', ['studioIntro', 'studioDetail'])}
              <div className="journey-inline-action">
                <LinkArrow href={url('music')} button>
                  {c('musicCta')}
                </LinkArrow>
              </div>
            </>
          )}
          {page === 'press' && (
            <>
              <PressMarks />
              <section className="journey-section journey-contact">
                <a
                  href={asset(
                    `/press/vessyl-overview${locale === 'es-LA' ? '-es-LA' : ''}.txt`,
                  )}
                  download
                >
                  {c('ui.pressDownload')}
                  <ArrowUpRight />
                </a>
                {prose('mediaName')}
                {prose('mediaOrg')}
                <a href={'mailto:' + c('mediaEmail')}>
                  {c('mediaEmail')}
                  <ArrowUpRight />
                </a>
              </section>
            </>
          )}
          {page === 'contact' && (
            <section className="journey-section journey-contact">
              <a href={BOOKING}>
                {c('bookStay')}
                <ArrowUpRight />
              </a>
              <a href={'mailto:' + EMAIL}>
                {EMAIL}
                <ArrowUpRight />
              </a>
              <a href="mailto:reservations@akenhotels.com">
                reservations@akenhotels.com
                <ArrowUpRight />
              </a>
              <a href="tel:+50686080022">
                +506 8608 0022
                <ArrowUpRight />
              </a>
              {prose('flights')}
            </section>
          )}
          {['faq', 'contact'].includes(page) && (
            <section className="journey-section">
              {page === 'contact' && <Heading text={c('faq')} align="center" />}
              <FaqList items={page === 'faq' ? faqs : faqs.slice(0, 4)} />
            </section>
          )}
          {page === 'home' && <EditorialFilm name="main" />}
          {hasTwoDoors && <TwoDoors />}
          <section className="journey-departure">
            <Photo id={photo(page, 'closing', 'closing-design-direction')} />
            <div>
              <Heading
                text={c(hasTwoDoors ? 'closingPresence' : 'stayCta')}
                light
                align="center"
              />
              {!hasTwoDoors && (
                <LinkArrow href={BOOKING} button light external>
                  {c('bookStay')}
                </LinkArrow>
              )}
            </div>
          </section>
          <footer className="journey-footer journey-section">
            <a href={url()}>
              <img
                src={asset('/brand/logo-white.svg')}
                alt="Vessyl"
                width="266"
                height="56"
              />
            </a>
            <nav aria-label={c('ui.mainNavigation')}>
              {Object.entries(pageTitles)
                .filter(([p]) => p !== 'home')
                .map(([p, title]) => (
                  <a key={p} href={url(p)}>
                    {title}
                  </a>
                ))}
            </nav>
            <div>
              <span>© {new Date().getFullYear()} Vessyl</span>
              <a href={'mailto:' + EMAIL}>{EMAIL}</a>
            </div>
            <nav className="edition-switch" aria-label={c('ui.edition')}>
              <a href={url(page, 'classic')}>{c('ui.classic')}</a>
              <a className="active" aria-current="true" href={url(page)}>
                {c('ui.immersive')}
              </a>
            </nav>
          </footer>
        </div>
      </main>
    </div>
  );
}
