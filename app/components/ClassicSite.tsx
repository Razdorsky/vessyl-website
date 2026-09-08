'use client';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  Plus,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../components/ui/tabs';
import {
  BOOKING,
  WAITLIST,
  EMAIL,
  getContent,
  type Practice,
} from '../../lib/content';
import { asset, pagePath } from '../../lib/paths';
import { classicPhoto } from '../../lib/classic-photography';
import { SiteNavigation } from './SiteNavigation';
import { type CopyKey, type Locale } from '../../lib/copy';
import { LocaleProvider, useLocale } from './LocaleProvider';
import { FluidMobileHeadings, Heading } from './Typography';
import { PressMarks } from './PressMarks';
import { AutoHeight } from './MotionPrimitives';
import { EditorialFilm } from './EditorialFilm';
import { PhotoCarousel } from './PhotoCarousel';
import { Photo, LinkArrow, Pattern, Gallery, FaqList } from './SitePrimitives';
export function ClassicSite({
  page,
  locale = 'en',
}: {
  page: string;
  locale?: Locale;
}) {
  return (
    <LocaleProvider locale={locale}>
      <FluidMobileHeadings>
        <ClassicPage page={page} />
      </FluidMobileHeadings>
    </LocaleProvider>
  );
}
function ClassicPage({ page }: { page: string }) {
  const { c, locale } = useLocale();
  const { pageTitles, experiences, practices, faqs } = getContent(locale);
  const edition = 'classic';
  const photo = (slot: string, fallback: string) =>
    classicPhoto(page, slot, fallback);
  const href = (p = 'home') => pagePath(edition, p, locale);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-waiting');
            entry.target.classList.add('editorial-enter');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(
        '.classic .photo-bridge > img, .classic .photo-bridge > div, .classic .experience-card, .classic .press-marks img, .classic .intro-section > div, .classic .section-heading, .classic .gallery-item',
      )
      .forEach((node) => {
        if (node.getBoundingClientRect().top < innerHeight) return;
        node.classList.add('reveal-waiting');
        observer.observe(node);
      });
    return () => observer.disconnect();
  }, [page]);
  const [selected, setSelected] = useState<Practice | null>(null);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const practiceDialog = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState('sound');
  const text = (key: CopyKey) => <p data-copy={key}>{c(key)}</p>;
  const heading = (key: CopyKey, light = false, centered = false) => (
    <Heading
      text={c(key)}
      light={light}
      align={centered ? 'center' : undefined}
    />
  );
  const hasSplitHeroPhoto = (image: string) =>
    page !== 'sessions' &&
    ['massage', 'session', 'equine-bond', 'pool', 'dining'].includes(image);
  const hero = (
    key: CopyKey,
    body: CopyKey | null,
    image: string,
    compact = false,
  ) => (
    <section
      className={`page-hero ${compact ? 'compact-hero' : ''} ${hasSplitHeroPhoto(image) ? 'people-hero' : ''}`}
    >
      <Photo
        id={photo('hero', image)}
        eager
        className="hero-photo"
        alt={pageTitles[page]}
        sizes={
          page === 'sessions' ? '(max-width: 820px) 1600px, 100vw' : undefined
        }
      />
      <div className="hero-shade" />
      <div className="page-hero-copy">
        <Heading
          as="h1"
          weight="bold"
          text={c(key)}
          light
          align={hasSplitHeroPhoto(image) ? undefined : 'center'}
        />
        {body && text(body)}
      </div>
    </section>
  );
  const intro = (
    title: CopyKey,
    bodies: CopyKey[],
    link?: [string, CopyKey],
    showTitle = title !== page,
  ) => (
    <section className="intro-section">
      <div>
        {showTitle && heading(title, false, true)}
        <div className="intro-body">
          {bodies.map((key) => (
            <p key={key} data-copy={key}>
              {c(key)}
            </p>
          ))}
        </div>
        {link && link[0] !== page && (
          <LinkArrow href={href(link[0])}>{c(link[1])}</LinkArrow>
        )}
      </div>
    </section>
  );
  const cardExperiences = [...experiences];
  if (page === 'home' || page === 'experience') {
    const domeIndex = cardExperiences.findIndex((item) => item.id === 'dome');
    if (domeIndex !== -1) {
      const [dome] = cardExperiences.splice(domeIndex, 1);
      cardExperiences.splice(2, 0, dome);
    }
  }
  const cards = (
    <div className="experience-grid">
      {cardExperiences.map((e) => (
        <a className="experience-card" key={e.id} href={href(e.id)}>
          <div className="image-window">
            <Photo id={photo(`experience:${e.id}`, e.image)} alt={e.name} />
            <span className="image-arrow">
              <ArrowUpRight size={23} />
            </span>
          </div>
          <Heading
            as={page === 'experience' ? 'h2' : 'h3'}
            visualStyle="h3"
            text={e.name}
          />
        </a>
      ))}
    </div>
  );
  const practiceCards = (items: Practice[]) => (
    <div className="practice-grid">
      {items.map((item) => (
        <button
          className="practice-card"
          key={item.id}
          onClick={() => {
            setSelected({
              ...item,
              image: photo(`practice:${item.id}`, item.image),
            });
            setPracticeOpen(true);
          }}
        >
          <div className="image-window">
            <Photo id={photo(`practice:${item.id}`, item.image)} />
            <span className="image-arrow">
              <Plus size={22} />
            </span>
          </div>
          <span className="eyebrow">
            {c(
              item.category === 'Quantum'
                ? 'ui.quantumCategory'
                : 'ui.wellnessCategory',
            )}
          </span>
          <Heading
            as={
              ['sessions', 'quantum', 'wellness'].includes(page) ? 'h2' : 'h3'
            }
            visualStyle="h3"
            text={item.title}
          />
          <p>{item.intro}</p>
        </button>
      ))}
    </div>
  );
  const sessions = (
    <section
      className={`session-cta section${page === 'experience' ? ' facilitators-pattern pattern-panel' : ''}`}
    >
      {page === 'experience' && <Pattern tone="paper" variant="fans" />}
      <div>
        {heading('guidesCta')}
        {text('guidesIntro')}
        <LinkArrow href={href('sessions')}>{c('sessionCta')}</LinkArrow>
      </div>
      <div className="session-cta-image">
        <Photo id={photo('facilitators-cta', 'massage')} alt={c('wellness')} />
      </div>
    </section>
  );
  const hasTwoDoors = page === 'home' || page === 'experience';
  const twoDoors = (
    <section className="two-doors section pattern-panel">
      <Pattern tone="forest" />
      <div className="two-doors-content">
        <div className="two-doors-heading">
          {heading('twoDoors', true)}
          {text('twoDoorsIntro')}
        </div>
        <div className="two-doors-options">
          <div className="two-doors-option">
            <span className="eyebrow">{c('inPerson')}</span>
            <Heading as="h3" text={c('stayCostaRica')} light />
            <LinkArrow href={BOOKING} button light external>
              {c('bookStay')}
            </LinkArrow>
          </div>
          <div className="two-doors-option">
            <span className="eyebrow">{c('fromAnywhere')}</span>
            <Heading as="h3" text={c('sessionsPocket')} light />
            <LinkArrow href={href('app')} button light>
              {c('downloadTheApp')}
            </LinkArrow>
          </div>
        </div>
      </div>
    </section>
  );
  const quote = (key: CopyKey, tone: 'paper' | 'copper' = 'paper') => (
    <section className={`quote-section quote-${tone} pattern-panel`}>
      <Pattern tone={tone} />
      <Heading
        as="blockquote"
        text={c(key)}
        align="center"
        light={tone === 'copper'}
      />
      <span className="eyebrow">{c('quoteAuthor')}</span>
    </section>
  );
  const gallery = (images: [string, CopyKey][], title: CopyKey = 'gallery') => (
    <Gallery
      title={c(title)}
      images={images.map(([id, k], index) => ({
        id: photo(`gallery:${index}`, id),
        caption: c(k),
      }))}
    />
  );
  const story = (
    image: string,
    title: CopyKey,
    body: CopyKey | null,
    link?: [string, CopyKey],
  ) => (
    <section className="split-editorial section photo-bridge">
      <Photo
        id={photo(title === 'founder' ? 'portrait' : `story:${title}`, image)}
        alt={c(title)}
      />
      <div>
        {title !== page && heading(title)}
        {body && text(body)}
        {link && link[0] !== page && (
          <LinkArrow href={href(link[0])}>{c(link[1])}</LinkArrow>
        )}
      </div>
    </section>
  );
  const location = (
    <section className="arrival-section section pattern-panel">
      <Pattern />
      <MapPin size={26} />
      <span className="eyebrow">{c('arrival')}</span>
      {heading('locationIntro', false, true)}
      <div className="three-columns travel-columns">
        <article>
          <Heading as="h3" text={c('drivingSjo')} align="center" />
          {text('travelSjo')}
        </article>
        <article>
          <Heading as="h3" text={c('drivingLir')} align="center" />
          {text('travelLir')}
        </article>
      </div>
      <p className="travel-flights" data-copy="flights">
        {c('flights')}
      </p>
      <LinkArrow href={href('contact')} button>
        {c('contact')}
      </LinkArrow>
    </section>
  );
  const divider = (
    <div className="section-divider" aria-hidden="true">
      <span />
    </div>
  );
  let content: ReactNode;
  if (page === 'home')
    content = (
      <>
        <section className="home-hero">
          <Photo
            id={photo('hero', 'hero-design-direction')}
            alt={c('locationIntro')}
            eager
            className="hero-photo"
          />
          <div className="hero-shade" />
          <div className="hero-copy">
            <Heading
              as="h1"
              weight="bold"
              align="center"
              text={c('homeHeadline')}
              light
            />
            {text('homeApproach')}
            <LinkArrow href={href('experience')} button light>
              {c('discover')}
            </LinkArrow>
          </div>
        </section>
        <div id="introduction" className="pattern-panel">
          <Pattern tone="forest" />
          <section className="intro-section home-introduction">
            <div>
              <Heading
                as="h3"
                text={c('homeShort').trim()}
                light
                align="center"
              />
              <div className="intro-body">{text('homeOrigins')}</div>
            </div>
          </section>
        </div>
        <div className="founder-bridge">
          {story('founder', 'founder', 'founderWhy', ['founder', 'founderCta'])}
        </div>
        <PressMarks />
        <section className="dome-feature home-dome-feature">
          <div className="dome-feature-image">
            <Photo
              id={photo('dome-feature', 'dome-design-direction')}
              alt={c('dome')}
              sizes="121vw"
            />
          </div>
          <img
            className="dome-echo"
            src={asset('/brand/dome-echo.svg')}
            width="1440"
            height="810"
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
          <div className="dome-feature-copy">
            <img
              className="dome-brand-mark"
              src={asset('/brand/dome-symbol.svg')}
              width="70"
              height="70"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            {heading('dome', true, true)}
            {text('domeIntro')}
            <LinkArrow href={href('dome')} button light>
              {c('learn')}
            </LinkArrow>
            <LinkArrow href={href('music')}>{c('studio')}</LinkArrow>
          </div>
        </section>
        <section className="section experience-section">
          <div className="section-heading">{heading('experience')}</div>
          {cards}
        </section>
        <div className="home-quote-sequence">
          {divider}
          {story('food', 'rancho', 'ranchoIntro', ['rancho', 'learn'])}
          {quote('quote', 'copper')}
          {sessions}
        </div>
        {divider}
        <EditorialFilm name="main" />
        {twoDoors}
      </>
    );
  else if (page === 'founder')
    content = (
      <>
        {hero('founder', 'founderOpening', 'nature')}
        <div className="founder-bridge founder-portrait-story">
          <section className="split-editorial section photo-bridge">
            <Photo id={photo('portrait', 'founder')} alt={c('quoteAuthor')} />
            <div className="founder-profile-copy">
              {heading('quoteAuthor')}
              {text('founderProfileLead')}
              {text('founderBrothers')}
            </div>
          </section>
        </div>
        <PressMarks />
        {divider}
        <section className="intro-section founder-biography">
          <div>
            <Heading
              as="h3"
              text={c('founderExplorationIntro')}
              align="center"
            />
            <div className="intro-body">
              {text('founderExplorationQuestion')}
              {text('founderNext')}
              {text('founderDestination')}
            </div>
          </div>
        </section>
        {divider}
        <EditorialFilm name="founder" />
        {quote('founderQuote')}
        {story('dome-exterior', 'press', 'ui.pressRoomIntro', [
          'press',
          'news',
        ])}
      </>
    );
  else if (page === 'experience')
    content = (
      <>
        {hero('experience', 'homeShort', 'hero-arenal')}
        <section className="section experience-section choice-section">
          <Heading
            as="h2"
            visualStyle="h3"
            text={c('choiceIntro')}
            align="center"
          />
          {cards}
        </section>
        {story('table', 'rancho', 'ranchoSoul', ['rancho', 'learn'])}
        {sessions}
        {story('dome-interior', 'music', 'musicIntro', ['music', 'musicCta'])}
        {twoDoors}
      </>
    );
  else if (page === 'dome')
    content = (
      <>
        {hero('dome', 'domeIntro', 'dome-interior')}
        <section className="sensory-section section">
          <div className="sensory-visual">
            <Photo id={photo('technology', 'dome-detail')} alt={c('dome')} />
          </div>
          <div className="sensory-copy">
            {heading('technology', true)}
            <Tabs value={layer} onValueChange={(v) => setLayer(String(v))}>
              <TabsList className="sensory-tabs" aria-label={c('technology')}>
                <TabsTrigger value="sound">{c('audio')}</TabsTrigger>
                <TabsTrigger value="light">{c('video')}</TabsTrigger>
                <TabsTrigger value="touch">{c('floor')}</TabsTrigger>
              </TabsList>
              <AutoHeight>
                <TabsContent value="sound">{text('soundIntro')}</TabsContent>
                <TabsContent value="light">{text('videoIntro')}</TabsContent>
                <TabsContent value="touch">{text('floorIntro')}</TabsContent>
              </AutoHeight>
            </Tabs>
          </div>
        </section>
        <section className="section">
          <div className="section-heading">
            {heading('domeSession')}
            <LinkArrow href={href('sessions')}>{c('sessionCta')}</LinkArrow>
          </div>
          {practiceCards(
            practices.filter((p) =>
              ['yoga-nidra', 'fractals', 'voices'].includes(p.id),
            ),
          )}
        </section>
        {gallery([
          ['dome-exterior', 'dome'],
          ['dome-interior', 'domeSession'],
          ['dome-practice', 'dome'],
        ])}
        <section className="music-strip section pattern-panel">
          <Pattern />
          {heading('studio', false, true)}
          {text('studioIntro')}
          {text('studioDetail')}
          <LinkArrow href={href('music')}>{c('musicCta')}</LinkArrow>
        </section>
      </>
    );
  else if (page === 'hearth')
    content = (
      <>
        {hero('hearth', 'hearthIntro', 'hearth')}
        <section className="hearth-section section pattern-panel">
          <Pattern tone="copper" />
          <div>
            {heading('hydro', true)}
            {text('hydroIntro')}
            <LinkArrow href={href('facilitators')}>{c('guidesCta')}</LinkArrow>
          </div>
          <div className="hearth-visual">
            <Photo id={photo('hydro', 'nature-waterfall')} alt={c('hydro')} />
          </div>
        </section>
        <section className="section">
          {practiceCards(
            practices.filter((p) =>
              ['breathwork', 'vibrational-yoga', 'qi-chai'].includes(p.id),
            ),
          )}
        </section>
        {gallery([
          ['hearth', 'hearth'],
          ['nature-waterfall', 'waterfalls'],
          ['nature', 'wellness'],
        ])}
        {sessions}
      </>
    );
  else if (page === 'nature')
    content = (
      <>
        {hero('nature', 'natureIntro', 'equine-bond')}
        {story('equine', 'horseBond', 'bondIntro', [
          'facilitators',
          'guidesCta',
        ])}
        {intro('river', ['riverIntro', 'enriqueIntro'])}
        {story('nature', 'birdwatching', 'birdIntro')}
        {story('nature', 'natureWalk', 'pathIntro')}
        {intro('park', ['destinationIntro'])}
        {gallery([
          ['equine-bond', 'horseBond'],
          ['nature', 'river'],
          ['nature-waterfall', 'natureWalk'],
        ])}
        {location}
      </>
    );
  else if (['sessions', 'quantum', 'wellness'].includes(page))
    content = (
      <>
        {hero(
          page as CopyKey,
          page === 'quantum' ? 'quantumApproach' : 'guidesIntro',
          page === 'quantum' ? 'session' : 'massage',
        )}
        <section className="section sessions-section choice-section">
          <Heading
            as={page === 'sessions' ? 'h3' : 'h2'}
            visualStyle="h3"
            text={c('choiceIntro')}
            align="center"
          />
          <Tabs
            defaultValue={
              page === 'quantum'
                ? 'Quantum'
                : page === 'wellness'
                  ? 'Wellness'
                  : 'All'
            }
          >
            <div className="session-filter">
              <TabsList className="filter-tabs" aria-label={c('sessions')}>
                {['All', 'Wellness', 'Quantum'].map((t) => (
                  <TabsTrigger value={t} key={t}>
                    {c(
                      t === 'All'
                        ? 'ui.all'
                        : t === 'Quantum'
                          ? 'ui.quantumCategory'
                          : 'ui.wellnessCategory',
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <AutoHeight>
              {['All', 'Wellness', 'Quantum'].map((t) => (
                <TabsContent value={t} key={t}>
                  {practiceCards(
                    t === 'All'
                      ? practices
                      : practices.filter((p) => p.category === t),
                  )}
                </TabsContent>
              ))}
            </AutoHeight>
          </Tabs>
        </section>
        {page === 'sessions' && <EditorialFilm name="sessions" />}
        {story('session', 'facilitators', 'guidesExpertiseIntro', [
          'facilitators',
          'guidesCta',
        ])}
      </>
    );
  else if (page === 'stay')
    content = (
      <>
        {hero('stay', 'stayIntro', 'pool')}
        <section className="section stay-options">
          <div className="section-heading">{heading('rooms')}</div>
          <div className="room-feature">
            <PhotoCarousel
              label={c('roomConcept')}
              images={['suite', 'villa'].map((id) => ({
                id: photo(`room:${id}`, id),
                caption: c('roomConcept'),
              }))}
            />
            <div className="room-description">
              {heading('roomConcept')}
              {text('stayAccommodation')}
              <LinkArrow href={BOOKING} button external>
                {c('bookStay')}
              </LinkArrow>
            </div>
          </div>
        </section>
        {gallery([
          ['suite-view', 'rooms'],
          ['villa-living', 'roomConcept'],
          ['villa-kitchen', 'hospitality'],
        ])}
        {story('food', 'rancho', 'ranchoIntro', ['rancho', 'learn'])}
        {location}
      </>
    );
  else if (page === 'rancho')
    content = (
      <>
        {hero('rancho', 'ranchoSoul', 'dining')}
        {intro('culinary', ['ranchoIntro', 'chefIntro', 'tableIntro'])}
        {story('food', 'rancho', 'ranchoRitual')}
        {gallery([
          ['food', 'culinary'],
          ['table', 'rancho'],
          ['dining', 'hospitality'],
        ])}
      </>
    );
  else if (page === 'app')
    content = (
      <>
        <section className="digital-hero section pattern-panel">
          <Pattern tone="forest" />
          <div>
            <Heading
              as="h1"
              weight="bold"
              align="center"
              text={c('appHeadline')}
              light
            />
            {text('appIntro')}
            <div className="store-actions">
              <button
                className="button cream"
                disabled
                title={c('ui.notConnected')}
              >
                {c('appStore')}
              </button>
              <button
                className="button cream"
                disabled
                title={c('ui.notConnected')}
              >
                {c('googlePlay')}
              </button>
            </div>
            <LinkArrow href={WAITLIST} external>
              {c('ui.waitlist')}
            </LinkArrow>
          </div>
        </section>
        {intro('appDoor', ['appStory'])}
        <section className="section three-columns app-features">
          <article>
            {heading('appLibrary', false, true)}
            {text('appLibraryIntro')}
          </article>
          <article>
            {heading('appGuides', false, true)}
            {text('appGuidesIntro')}
            <LinkArrow href={href('facilitators')}>{c('guidesCta')}</LinkArrow>
          </article>
        </section>
        <section className="section">
          <div className="section-heading">{heading('sessions')}</div>
          {practiceCards(
            practices.filter((p) =>
              [
                'quantum-self',
                'chakra',
                'breathwork',
                'vibrational-yoga',
              ].includes(p.id),
            ),
          )}
        </section>
        {sessions}
      </>
    );
  else if (page === 'music')
    content = (
      <>
        {hero('music', 'musicIntro', 'dome-interior')}
        {intro('studio', ['studioIntro', 'studioDetail'])}
        <EditorialFilm name="music" />
        {story('dome-detail', 'dome', 'domeIntro', ['dome', 'learn'])}
      </>
    );
  else if (page === 'facilitators')
    content = (
      <>
        {hero('facilitators', 'guidesIntro', 'session', true)}
        <section className="section people-list">
          {[
            ['Enrique Molina', 'enriqueIntro', 'equine'],
            ['Oscar', 'birdIntro', 'nature'],
          ].map(([name, key, image]) => (
            <article key={name}>
              <figure className="guide-activity">
                <Photo
                  id={photo(`guide:${name}`, image)}
                  alt={image === 'equine' ? c('horseBond') : c('birdwatching')}
                />
                <figcaption>
                  {image === 'equine' ? c('horseBond') : c('birdwatching')}
                </figcaption>
              </figure>
              <div>
                <Heading text={name} />
                {text(key as CopyKey)}
                <LinkArrow href={href('contact')}>{c('contact')}</LinkArrow>
              </div>
            </article>
          ))}
        </section>
      </>
    );
  else if (page === 'contact')
    content = (
      <>
        <section className="plain-hero section">
          <Heading as="h1" weight="bold" align="center" text={c('contact')} />
          {text('locationIntro')}
        </section>
        <section className="section contact-grid">
          <div>
            <div className="contact-links">
              <a href={BOOKING} target="_blank" rel="noreferrer">
                <ArrowUpRight />
                <span>
                  {c('bookStay')}
                  <strong>AKEN</strong>
                </span>
              </a>
              <a href={`mailto:${EMAIL}`}>
                <Mail />
                <span>
                  {c('ui.contactGuest')}
                  <strong>{EMAIL}</strong>
                </span>
              </a>
              <a href="mailto:reservations@akenhotels.com">
                <Mail />
                <span>
                  {c('ui.contactReservation')}
                  <strong>reservations@akenhotels.com</strong>
                </span>
              </a>
              <a href="tel:+50686080022">
                <Phone />
                <span>+506 8608 0022</span>
              </a>
              <a href={`mailto:${c('mediaEmail')}`}>
                <Mail />
                <span>
                  {c('mediaName')}
                  <strong>{c('mediaEmail')}</strong>
                </span>
              </a>
            </div>
          </div>
          <div className="contact-aside">
            <Photo
              id={photo('aside', 'dome-exterior')}
              alt={c('destinationIntro')}
            />
            <div>
              {heading('arrival')}
              {text('destinationIntro')}
              {text('flights')}
            </div>
          </div>
        </section>
        <section className="section faq-preview">
          <div>
            {heading('faq')}
            <LinkArrow href={href('faq')}>{c('learn')}</LinkArrow>
          </div>
          <FaqList items={faqs.slice(0, 4)} />
        </section>
      </>
    );
  else if (page === 'faq')
    content = (
      <>
        <section className="plain-hero section">
          <Heading as="h1" weight="bold" align="center" text={c('faq')} />
        </section>
        <section className="section faq-page">
          <aside>
            <LinkArrow href={href('contact')}>{c('contact')}</LinkArrow>
          </aside>
          <FaqList items={faqs} headingLevel={2} />
        </section>
      </>
    );
  else
    content = (
      <>
        <section className="plain-hero section">
          <Heading as="h1" weight="bold" align="center" text={c('press')} />
          {text('homeShort')}
        </section>
        {intro('overview', ['homeOrigins'], undefined, false)}
        <section className="section press-resources">
          {heading('facts')}
          <div className="resource-links">
            <a
              href={asset(
                `/press/vessyl-overview${locale === 'es-LA' ? '-es-LA' : ''}.txt`,
              )}
              download
            >
              <span>{c('ui.pressDownload')}</span>
              <ArrowDown />
            </a>
            <a href={href('founder')}>
              <span>{c('founder')}</span>
              <ArrowUpRight />
            </a>
            <a href={href('dome')}>
              <span>{c('dome')}</span>
              <ArrowUpRight />
            </a>
          </div>
          <p>
            {c('mediaName')} · {c('mediaOrg')}
          </p>
          <LinkArrow href={`mailto:${c('mediaEmail')}`}>
            {c('mediaEmail')}
          </LinkArrow>
        </section>
      </>
    );
  return (
    <div
      className={`site ${edition}`}
      data-page={page}
      data-locale={locale}
      lang={locale === 'es-LA' ? 'es-419' : 'en'}
    >
      <a className="skip-link" href="#content">
        {c('ui.skip')}
      </a>
      <SiteNavigation edition={edition} page={page} />
      <main id="content">
        {content}
        <section
          className={`closing-invitation ${hasTwoDoors ? 'closing-signature' : ''} ${page === 'home' ? 'closing-reference' : ''}`}
        >
          <Photo
            id={photo(
              'closing',
              page === 'home'
                ? 'closing-design-direction'
                : page === 'experience'
                  ? 'nature-waterfall'
                  : 'hero-arenal',
            )}
            alt=""
            sizes={
              page === 'home' ? '(max-width: 1000px) 1120px, 100vw' : '100vw'
            }
          />
          <div />
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
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-grid">
          {[
            [
              'founder',
              [
                ['founder', 'founder'],
                ['press', 'press'],
              ],
            ],
            [
              'experience',
              [
                ['experience', 'experience'],
                ['dome', 'dome'],
                ['hearth', 'hearth'],
                ['nature', 'nature'],
                ['music', 'music'],
              ],
            ],
            [
              'sessions',
              [
                ['sessions', 'sessions'],
                ['quantum', 'quantum'],
                ['wellness', 'wellness'],
                ['facilitators', 'facilitators'],
                ['app', 'app'],
              ],
            ],
            [
              'stay',
              [
                ['stay', 'stay'],
                ['rancho', 'rancho'],
                ['contact', 'contact'],
                ['faq', 'faq'],
              ],
            ],
          ].map(([key, links]) => (
            <div key={key as string}>
              <a className="eyebrow" href={href(key as string)}>
                {c(key as CopyKey)}
              </a>
              {(links as string[][])
                .filter(([p]) => p !== key)
                .map(([p, label]) => (
                  <a href={href(p)} key={p}>
                    {c(label as CopyKey)}
                  </a>
                ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Vessyl</span>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
        <nav className="edition-switch" aria-label={c('ui.edition')}>
          <a
            className="active"
            aria-current="true"
            href={pagePath('classic', page, locale)}
          >
            {c('ui.classic')}
          </a>
          <a href={pagePath('immersive', page, locale)}>{c('ui.immersive')}</a>
        </nav>
      </footer>
      <Dialog
        open={practiceOpen}
        onOpenChange={setPracticeOpen}
        onOpenChangeComplete={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          closeLabel={c('ui.close')}
          className="practice-dialog classic-controls"
          ref={practiceDialog}
          initialFocus={practiceDialog}
        >
          {selected && (
            <div className="practice-dialog-body">
              <Photo id={selected.image} alt="" />
              <div className="practice-dialog-copy">
                <span className="eyebrow">
                  {c(
                    selected.category === 'Quantum'
                      ? 'ui.quantumCategory'
                      : 'ui.wellnessCategory',
                  )}
                </span>
                <DialogTitle>
                  <Heading as="span" text={selected.title} />
                </DialogTitle>
                <DialogDescription>{selected.body}</DialogDescription>
                <LinkArrow
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent(c('personalBook') + ': ' + selected.title)}`}
                  button
                >
                  {c('personalBook')}
                </LinkArrow>
                <small>{c('ui.enquiryNote')}</small>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
