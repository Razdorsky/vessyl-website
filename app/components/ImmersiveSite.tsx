'use client';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ArrowDown, ArrowUpRight, Pause, Play, Plus } from 'lucide-react';
import { SiteNavigation } from './SiteNavigation';
import { Heading } from './Typography';
import { PressMarks } from './PressMarks';
import { Photo, Film, FaqList, Gallery, LinkArrow } from './SitePrimitives';
import { copy as c, type CopyKey } from '../../lib/copy';
import { journeys, containedChapter } from '../../lib/journeys';
import {
  BOOKING,
  EMAIL,
  WAITLIST,
  pageTitles,
  practices,
  faqs,
} from '../../lib/content';
import { asset, basePath } from '../../lib/paths';
import { AutoHeight, Disclosure } from './MotionPrimitives';
import { journeyPosition } from '../../lib/journey-position';
const ScrollWorld = lazy(() => import('./ScrollWorld'));
const url = (page = 'home', edition = 'immersive') =>
  `${basePath}/${edition}/${page === 'home' ? '' : page + '/'}`;
function SessionLibrary({ page }: { page: string }) {
  const [filter, setFilter] = useState(
    page === 'quantum' ? 'Quantum' : page === 'wellness' ? 'Wellness' : 'All',
  );
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <section className="journey-library journey-section" id="session-library">
      <div className="journey-section-title">
        <span className="eyebrow">{c('sessionCta')}</span>
        <Heading text={c('sessions')} />
      </div>
      <div className="journey-filters" aria-label={c('sessions')}>
        {['All', 'Quantum', 'Wellness'].map((f) => (
          <button
            key={f}
            aria-pressed={f === filter}
            onClick={() => {
              setFilter(f);
              setOpened(null);
            }}
          >
            {f === 'All' ? c('ui.all') : f}
          </button>
        ))}
      </div>
      <AutoHeight>
        <div className="journey-session-list" key={filter}>
          {practices
            .filter((p) => filter === 'All' || p.category === filter)
            .map((p, i) => (
              <article className="journey-session" key={p.id}>
                <button
                  aria-expanded={opened === p.id}
                  aria-controls={'practice-' + p.id}
                  onClick={() => setOpened(opened === p.id ? null : p.id)}
                >
                  <span className="session-number">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Photo id={p.image} />
                  <span>
                    <small>{p.category}</small>
                    <Heading as="h3" text={p.title} />
                  </span>
                  <Plus />
                </button>
                <Disclosure open={opened === p.id} id={'practice-' + p.id}>
                  <div className="journey-session-body">
                    <p>{p.body}</p>
                    <LinkArrow
                      href={`mailto:${EMAIL}?subject=${encodeURIComponent(c('personalBook') + ': ' + p.title)}`}
                      button
                    >
                      {c('personalBook')}
                    </LinkArrow>
                    <p className="small-note">{c('ui.enquiryNote')}</p>
                  </div>
                </Disclosure>
              </article>
            ))}
        </div>
      </AutoHeight>
    </section>
  );
}
export function ImmersiveSite({ page }: { page: string }) {
  const chapters = journeys[page];
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [paused, setPaused] = useState(false),
    [active, setActive] = useState(0);
  const onReady = useCallback(() => setReady(true), []),
    onFailure = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let frame = 0;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    setPaused(media.matches);
    const preferenceChanged = () => setPaused(media.matches);
    media.addEventListener('change', preferenceChanged);
    const update = () => {
      frame = 0;
      const track = el.querySelector<HTMLElement>('.journey-track');
      if (!track) return;
      const { bounds: rect, progress } = journeyPosition(track);
      const index = Math.min(chapters.length - 1, Math.floor(progress + 0.15));
      setActive(index);
      const inJourney = rect.bottom > innerHeight * 0.35;
      el.dataset.inJourney = String(inJourney);
      const controls = el.querySelector<HTMLElement>('.journey-controls');
      controls?.toggleAttribute('inert', !inJourney);
      controls?.setAttribute('aria-hidden', String(!inJourney));
      el.style.setProperty(
        '--journey-progress',
        String(Math.min(1, progress / chapters.length)),
      );
      el.querySelectorAll<HTMLElement>('.journey-chapter').forEach(
        (section, i) => {
          const local = progress - i;
          const fade = media.matches
            ? 1
            : Math.max(0, Math.min(1, (0.84 - local) * 5.5));
          section.style.setProperty('--chapter-opacity', String(fade));
          if (i === index) {
            const copy = section.querySelector<HTMLElement>('.journey-copy');
            const end = Math.min(
              innerHeight - 98,
              Math.max(
                innerHeight * 0.48,
                (copy?.getBoundingClientRect().bottom || 0) + 16,
              ),
            );
            el.style.setProperty('--copy-scrim-end', `${end}px`);
          }
        },
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const copyObserver = new ResizeObserver(schedule);
    el.querySelectorAll('.journey-copy').forEach((copy) =>
      copyObserver.observe(copy),
    );
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      copyObserver.disconnect();
      media.removeEventListener('change', preferenceChanged);
    };
  }, [chapters]);
  const supplemental: Partial<Record<string, [CopyKey, CopyKey[]]>> = {
    home: ['home', ['homeIntro']],
    nature: ['park', ['destinationIntro']],
    hearth: ['hearthSession', ['choiceIntro']],
    rancho: ['culinary', ['ranchoRitual']],
    facilitators: ['sessions', ['guidesIntro']],
    stay: ['arrival', ['locationIntro', 'travelSjo', 'travelLir', 'flights']],
    press: ['facts', ['founderWhy']],
  };
  const details = supplemental[page];
  return (
    <div
      ref={root}
      className={`site immersive-journey ${ready ? 'world-ready' : ''} ${failed ? 'world-failed' : ''}`}
      data-page={page}
      data-in-journey="true"
      data-renderer="independent-scroll-world"
    >
      <a className="skip-link" href="#content">
        {c('ui.skip')}
      </a>
      <SiteNavigation edition="immersive" page={page} />
      <div className="journey-stage">
        <img
          className={`journey-poster ${containedChapter(chapters[0]) ? 'poster-contained' : ''}`}
          src={asset('/images/' + chapters[0].image + '.webp')}
          alt=""
          fetchPriority="high"
        />
        {!failed && (
          <Suspense fallback={null}>
            <ScrollWorld
              chapters={chapters}
              paused={paused}
              onReady={onReady}
              onFailure={onFailure}
            />
          </Suspense>
        )}
        <div className="journey-scrim" />
      </div>
      <main id="content">
        <div className="journey-track">
          {chapters.map((chapter, i) => (
            <section
              key={i}
              className={`journey-chapter chapter-${chapter.world} ${containedChapter(chapter) ? 'chapter-contained' : ''} ${i === 0 && page === 'home' ? 'chapter-opening' : ''}`}
              id={'chapter-' + i}
              data-journey-chapter={i}
              tabIndex={-1}
            >
              <div className="journey-copy">
                <div className="chapter-label">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>{c(i === 0 ? 'home' : chapter.title)}</span>
                  <i />
                </div>
                <Heading
                  as={i === 0 ? 'h1' : 'h2'}
                  text={c(chapter.title)}
                  light
                />
                <div className="chapter-prose">
                  {chapter.body.map((key) => (
                    <p data-copy={key} key={key}>
                      {c(key)}
                    </p>
                  ))}
                </div>
                {chapter.to && (
                  <LinkArrow href={url(chapter.to)} light>
                    {c(chapter.action || 'learn')}
                  </LinkArrow>
                )}
                {i === 0 && (
                  <a
                    className="journey-scroll-hint"
                    href={
                      chapters.length > 1 ? '#chapter-1' : '#journey-details'
                    }
                  >
                    <ArrowDown size={16} />
                    {c('ui.scroll')}
                  </a>
                )}
              </div>
              {(failed || !ready) && (
                <img
                  className="chapter-fallback"
                  src={asset('/images/' + chapter.image + '.webp')}
                  alt=""
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              )}
            </section>
          ))}
        </div>
        <div className="journey-details" id="journey-details">
          {['home', 'founder', 'press'].includes(page) && <PressMarks />}
          {page === 'founder' && (
            <div className="journey-film">
              <Film autoPlay />
            </div>
          )}
          {details && (
            <section className="journey-section journey-editorial">
              <span className="eyebrow">{pageTitles[page]}</span>
              <div>
                <Heading text={c(details[0])} />
                {details[1].map((k) => (
                  <p key={k}>{c(k)}</p>
                ))}
              </div>
            </section>
          )}
          {['home', 'founder'].includes(page) && (
            <section className="journey-quote journey-section">
              <Heading as="blockquote" text={c('quote')} />
              <span className="eyebrow">{c('quoteAuthor')}</span>
            </section>
          )}
          {[
            'sessions',
            'quantum',
            'wellness',
            'app',
            'dome',
            'hearth',
          ].includes(page) && <SessionLibrary page={page} />}
          {page === 'app' && (
            <section className="journey-section journey-store">
              <Heading text={c('appHeadline')} />
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
          )}
          {page === 'music' && (
            <div className="journey-film">
              <Film />
            </div>
          )}
          {page === 'stay' && (
            <Gallery
              images={[
                { id: 'suite-view', caption: c('rooms') },
                { id: 'villa-living', caption: c('roomConcept') },
                { id: 'villa-kitchen', caption: c('hospitality') },
              ]}
            />
          )}
          {page === 'rancho' && (
            <Gallery
              images={[
                { id: 'food', caption: c('culinary') },
                { id: 'table', caption: c('rancho') },
                { id: 'dining', caption: c('hospitality') },
              ]}
            />
          )}
          {page === 'dome' && (
            <Gallery
              images={[
                { id: 'dome-exterior', caption: c('dome') },
                { id: 'dome-interior', caption: c('domeSession') },
                { id: 'dome-detail', caption: c('studio') },
              ]}
            />
          )}
          {page === 'press' && (
            <section className="journey-section journey-contact">
              <a href={asset('/press/vessyl-overview.txt')} download>
                {c('ui.pressDownload')}
                <ArrowUpRight />
              </a>
              <p>
                {c('mediaName')} · {c('mediaOrg')}
              </p>
              <a href={'mailto:' + c('mediaEmail')}>
                {c('mediaEmail')}
                <ArrowUpRight />
              </a>
            </section>
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
              <p>{c('flights')}</p>
            </section>
          )}
          {['faq', 'contact'].includes(page) && (
            <section className="journey-section">
              <Heading text={c('faq')} />
              <FaqList items={page === 'faq' ? faqs : faqs.slice(0, 4)} />
            </section>
          )}
          <section className="journey-departure">
            <Photo id="hero-arenal" alt={c('locationIntro')} />
            <div>
              <span className="eyebrow">{c('hospitality')}</span>
              <Heading text={c('stayCta')} light />
              <LinkArrow href={BOOKING} button light external>
                {c('bookStay')}
              </LinkArrow>
            </div>
          </section>
          <footer className="journey-footer journey-section">
            <a href={url()}>
              <img
                src={asset('/brand/logo-white.svg')}
                alt="Vessyl"
                width="190"
                height="40"
              />
            </a>
            <nav aria-label="Explore Vessyl">
              {Object.entries(pageTitles)
                .filter(([p]) => p !== 'home')
                .map(([p, title]) => (
                  <a key={p} href={url(p)}>
                    {title}
                    <ArrowUpRight size={14} />
                  </a>
                ))}
            </nav>
            <div>
              <span>© {new Date().getFullYear()} Vessyl</span>
              <a href={'mailto:' + EMAIL}>{EMAIL}</a>
            </div>
          </footer>
        </div>
      </main>
      <aside className="journey-controls" aria-label={c('ui.immersive')}>
        {!failed && (
          <button
            onClick={() => setPaused(!paused)}
            aria-label={paused ? c('ui.play3d') : c('ui.pause3d')}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            <span>{paused ? c('ui.play') : c('ui.pause')}</span>
          </button>
        )}
        <span>
          {String(active + 1).padStart(2, '0')} /{' '}
          {String(chapters.length).padStart(2, '0')}
        </span>
        <div className="journey-progress">
          <i />
        </div>
      </aside>
      <nav className="edition-switch" aria-label={c('ui.edition')}>
        <a href={url(page, 'classic')}>{c('ui.classic')}</a>
        <a className="active" aria-current="true" href={url(page)}>
          {c('ui.immersive')}
        </a>
      </nav>
    </div>
  );
}
