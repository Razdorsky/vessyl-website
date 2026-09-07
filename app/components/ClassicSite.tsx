'use client';
import { useState, useEffect, type ReactNode } from 'react';
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
  pageTitles,
  experiences,
  practices,
  faqs,
  type Practice,
} from '../../lib/content';
import { asset, basePath } from '../../lib/paths';
import { SiteNavigation } from './SiteNavigation';
import { copy as c, type CopyKey } from '../../lib/copy';
import { Heading } from './Typography';
import { PressMarks } from './PressMarks';
import { AutoHeight } from './MotionPrimitives';
import {
  Photo,
  LinkArrow,
  Pattern,
  Gallery,
  Film,
  FaqList,
} from './SitePrimitives';
export function ClassicSite({ page }: { page: string }) {
  const edition = 'classic';
  const href = (p = 'home') =>
    `${basePath}/${edition}/${p === 'home' ? '' : `${p}/`}`;
  const immersive = false;
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
  const [layer, setLayer] = useState('sound');
  const text = (key: CopyKey) => <p data-copy={key}>{c(key)}</p>;
  const heading = (key: CopyKey, light = false) => (
    <Heading text={c(key)} light={light} />
  );
  const hero = (
    key: CopyKey,
    body: CopyKey | null,
    image: string,
    compact = false,
  ) => (
    <section
      className={`page-hero ${compact ? 'compact-hero' : ''} ${['massage', 'session', 'equine-bond', 'pool', 'dining'].includes(image) ? 'people-hero' : ''}`}
    >
      <Photo id={image} eager className="hero-photo" alt={pageTitles[page]} />
      <div className="hero-shade" />
      <div className="page-hero-copy">
        <span className="eyebrow light">{c('locationIntro')}</span>
        <Heading as="h1" text={c(key)} light />
        {body && text(body)}
      </div>
    </section>
  );
  const intro = (
    title: CopyKey,
    bodies: CopyKey[],
    link?: [string, CopyKey],
  ) => (
    <section className="intro-section">
      <span className="eyebrow">{pageTitles[page]}</span>
      <div>
        {heading(title)}
        <div className="intro-body">
          {bodies.map((key) => (
            <p key={key} data-copy={key}>
              {c(key)}
            </p>
          ))}
        </div>
        {link && <LinkArrow href={href(link[0])}>{c(link[1])}</LinkArrow>}
      </div>
    </section>
  );
  const cards = (
    <div className="experience-grid">
      {experiences.map((e) => (
        <a className="experience-card" key={e.id} href={href(e.id)}>
          <div className="image-window">
            <Photo id={e.image} alt={e.name} />
            <span className="image-arrow">
              <ArrowUpRight size={23} />
            </span>
            <span className="image-number">{e.number}</span>
          </div>
          <Heading as="h3" text={e.name} />
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
            setSelected(item);
            setPracticeOpen(true);
          }}
        >
          <div className="image-window">
            <Photo id={item.image} />
            <span className="image-arrow">
              <Plus size={22} />
            </span>
          </div>
          <span className="eyebrow">{item.category}</span>
          <Heading as="h3" text={item.title} />
          <p>{item.intro}</p>
        </button>
      ))}
    </div>
  );
  const sessions = (
    <section className="session-cta section">
      <div>
        <span className="eyebrow">{c('sessions')}</span>
        {heading('guidesCta')}
        {text('guidesIntro')}
        <LinkArrow href={href('sessions')}>{c('sessionCta')}</LinkArrow>
      </div>
      <div className="session-cta-image">
        <Photo id="massage" alt={c('wellness')} />
      </div>
    </section>
  );
  const app = (
    <section className="app-cta section pattern-panel">
      <Pattern kind="fans" />
      <div className="app-graphic" aria-hidden="true" />
      <div>
        <span className="eyebrow light">{c('digital')}</span>
        {heading('appHeadline', true)}
        {text('appIntro')}
        <LinkArrow href={href('app')} button light>
          {c('download')}
        </LinkArrow>
      </div>
    </section>
  );
  const quote = (
    <section className="quote-section pattern-panel">
      <Pattern />
      <Heading as="blockquote" text={c('quote')} />
      <span className="eyebrow">{c('quoteAuthor')}</span>
      <LinkArrow href={href('founder')}>{c('founderCta')}</LinkArrow>
    </section>
  );
  const gallery = (images: [string, CopyKey][], title: CopyKey = 'gallery') => (
    <Gallery
      title={c(title)}
      images={images.map(([id, k]) => ({ id, caption: c(k) }))}
    />
  );
  const story = (
    image: string,
    title: CopyKey,
    body: CopyKey,
    link?: [string, CopyKey],
  ) => (
    <section className="split-editorial section photo-bridge">
      <Photo id={image} alt={c(title)} />
      <div>
        {heading(title)}
        {text(body)}
        {link && <LinkArrow href={href(link[0])}>{c(link[1])}</LinkArrow>}
      </div>
    </section>
  );
  const location = (
    <section className="arrival-section section pattern-panel">
      <Pattern kind="fans" />
      <MapPin size={26} />
      <span className="eyebrow">{c('arrival')}</span>
      {heading('locationIntro')}
      <div className="three-columns travel-columns">
        <article>
          <Heading as="h3" text={c('drivingSjo')} />
          {text('travelSjo')}
        </article>
        <article>
          <Heading as="h3" text={c('drivingLir')} />
          {text('travelLir')}
        </article>
        <article>{text('flights')}</article>
      </div>
      <LinkArrow href={href('contact')} button>
        {c('contact')}
      </LinkArrow>
    </section>
  );
  let content: ReactNode;
  if (page === 'home')
    content = (
      <>
        <section className="home-hero">
          <Photo
            id="hero-arenal"
            alt={c('locationIntro')}
            eager
            className="hero-photo"
          />
          <div className="hero-shade" />
          <div className="hero-copy">
            <span className="eyebrow light">{c('home')}</span>
            <Heading as="h1" text={c('homeHeadline')} light />
            {text('homeShort')}
            <LinkArrow href={href('experience')} button light>
              {c('discover')}
            </LinkArrow>
          </div>
          <div className="hero-bottom">
            <a href="#introduction">
              <ArrowDown size={16} />
              {c('ui.scroll')}
            </a>
            <span>{c('locationIntro')}</span>
          </div>
        </section>
        <div id="introduction" className="pattern-panel">
          <Pattern />
          {intro('home', ['homeIntro'])}
        </div>
        <div className="founder-bridge">
          {story('founder', 'founder', 'founderWhy', ['founder', 'founderCta'])}
        </div>
        <PressMarks />
        <section className="dome-feature">
          <div className="dome-feature-image">
            <Photo id="dome-interior" alt={c('dome')} />
          </div>
          <div className="dome-feature-copy">
            <span className="eyebrow light">{c('experience')}</span>
            {heading('dome', true)}
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
        {story('food', 'rancho', 'ranchoIntro', ['rancho', 'learn'])}
        {quote}
        {sessions}
        {app}
      </>
    );
  else if (page === 'founder')
    content = (
      <>
        {hero('founder', 'founderIntro', 'nature')}
        <div className="founder-bridge founder-portrait-story">
          {story('founder', 'quoteAuthor', 'founderWhy')}
        </div>
        <PressMarks />
        {intro('quoteAuthor', [
          'founderStory',
          'founderQuestion',
          'founderNext',
        ])}
        <Film autoPlay />
        {quote}
        {story('dome-exterior', 'press', 'founderWhy', ['press', 'news'])}
      </>
    );
  else if (page === 'experience')
    content = (
      <>
        {hero('experience', 'homeShort', 'hero-arenal')}
        {intro('experience', ['choiceIntro'])}
        <section className="section experience-section">{cards}</section>
        {story('table', 'rancho', 'ranchoSoul', ['rancho', 'learn'])}
        {sessions}
        {story('dome-interior', 'music', 'musicIntro', ['music', 'musicCta'])}
        {app}
      </>
    );
  else if (page === 'dome')
    content = (
      <>
        {hero('dome', 'domeIntro', 'dome-interior')}
        <section className="sensory-section section">
          <div className="sensory-visual">
            <Photo id="dome-detail" alt={c('dome')} />
          </div>
          <div className="sensory-copy">
            <span className="eyebrow light">{c('technology')}</span>
            {heading('dome', true)}
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
          ['dome-practice', 'sessions'],
        ])}
        <section className="music-strip section pattern-panel">
          <Pattern kind="wave" />
          <span className="eyebrow">{c('music')}</span>
          {heading('studio')}
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
          <Pattern kind="wave" />
          <div>
            <span className="eyebrow light">{c('hearthSession')}</span>
            {heading('hydro', true)}
            {text('hydroIntro')}
            <LinkArrow href={href('facilitators')}>{c('guidesCta')}</LinkArrow>
          </div>
          <div className="hearth-visual">
            <Photo id="nature-waterfall" alt={c('waterfalls')} />
          </div>
        </section>
        <section className="section">
          {practiceCards(
            practices.filter((p) =>
              ['hydro', 'breathwork', 'hearth'].includes(p.id),
            ),
          )}
        </section>
        {gallery([
          ['nature-waterfall', 'waterfalls'],
          ['nature', 'natureWalk'],
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
          ['nature', 'natureWalk'],
          ['nature-waterfall', 'waterfalls'],
        ])}
        {location}
      </>
    );
  else if (['sessions', 'quantum', 'wellness'].includes(page))
    content = (
      <>
        {hero(
          page as CopyKey,
          page === 'quantum' ? 'quantumIntro' : 'guidesIntro',
          page === 'quantum' ? 'session' : 'massage',
        )}
        {intro('sessions', ['choiceIntro'])}
        <section className="section sessions-section">
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
              <span className="eyebrow">{c('sessionCta')}</span>
              <TabsList className="filter-tabs" aria-label={c('sessions')}>
                {['All', 'Quantum', 'Wellness'].map((t) => (
                  <TabsTrigger value={t} key={t}>
                    {t === 'All' ? c('ui.all') : t}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <AutoHeight>
              {['All', 'Quantum', 'Wellness'].map((t) => (
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
          <p className="small-note">{c('ui.enquiryNote')}</p>
        </section>
        {story('session', 'facilitators', 'guidesIntro', [
          'facilitators',
          'guidesCta',
        ])}
      </>
    );
  else if (page === 'stay')
    content = (
      <>
        {hero('stay', 'stayIntro', 'pool')}
        {intro('rooms', ['stayIntro'])}
        <section className="section stay-options">
          <Tabs defaultValue="suite">
            <div className="section-heading">
              {heading('rooms')}
              <TabsList className="filter-tabs" aria-label={c('rooms')}>
                <TabsTrigger value="suite">01</TabsTrigger>
                <TabsTrigger value="villa">02</TabsTrigger>
              </TabsList>
            </div>
            <AutoHeight>
              {[
                ['suite', 'Pulse Suite'],
                ['villa', 'Pulse Villa'],
              ].map(([id, name]) => (
                <TabsContent value={id} key={id}>
                  <div className="room-feature">
                    <Photo id={id} alt={name} />
                    <div>
                      <span className="eyebrow">{c('stay')}</span>
                      <Heading as="h3" text={c('rooms')} />
                      <LinkArrow href={BOOKING} button external>
                        {c('bookStay')}
                      </LinkArrow>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </AutoHeight>
          </Tabs>
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
        <section className="digital-hero section">
          <div>
            <span className="eyebrow light">{c('app')}</span>
            <Heading as="h1" text={c('appHeadline')} light />
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
          <div className="digital-symbol">
            <div className="app-artwork">
              <Pattern kind="fans" />
            </div>
          </div>
        </section>
        {intro('appDoor', ['appStory'])}
        <section className="section three-columns">
          <article>
            {heading('appLibrary')}
            {text('appLibraryIntro')}
          </article>
          <article>
            {heading('appGuides')}
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
        <Film />
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
                  id={image}
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
        {intro('sessions', ['guidesIntro'], ['sessions', 'sessionCta'])}
      </>
    );
  else if (page === 'contact')
    content = (
      <>
        <section className="plain-hero section">
          <span className="eyebrow">{c('contact')}</span>
          <Heading as="h1" text={c('contact')} />
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
            <Photo id="dome-exterior" alt={c('dome')} />
            <div>
              {heading('arrival')}
              {text('locationIntro')}
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
          <Heading as="h1" text={c('faq')} />
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
          <span className="eyebrow">{c('press')}</span>
          <Heading as="h1" text={c('press')} />
          {text('homeShort')}
        </section>
        {intro('overview', ['homeIntro', 'founderIntro'])}
        <section className="section press-resources">
          {heading('facts')}
          <div className="resource-links">
            <a href={asset('/press/vessyl-overview.txt')} download>
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
    <div className={`site ${edition}`} data-page={page}>
      <a className="skip-link" href="#content">
        {c('ui.skip')}
      </a>
      <SiteNavigation edition={edition} page={page} />
      <main id="content">
        {content}
        <section className="closing-invitation">
          <Photo id="hero-arenal" alt="" />
          <div />
          <span className="eyebrow light">{c('hospitality')}</span>
          <Heading text={c('stayCta')} light />
          <LinkArrow href={BOOKING} button light external>
            {c('bookStay')}
          </LinkArrow>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-statement">
            <Heading text={c('home')} light />
          </div>
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
              <span className="eyebrow">{c(key as CopyKey)}</span>
              {(links as string[][]).map(([p, label]) => (
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
          <span>AKEN Soul</span>
        </div>
      </footer>
      <nav className="edition-switch" aria-label={c('ui.edition')}>
        <a
          className={immersive ? '' : 'active'}
          aria-current={!immersive ? 'true' : undefined}
          href={`${basePath}/classic/${page === 'home' ? '' : page + '/'}`}
        >
          {c('ui.classic')}
        </a>
        <a
          className={immersive ? 'active' : ''}
          aria-current={immersive ? 'true' : undefined}
          href={`${basePath}/immersive/${page === 'home' ? '' : page + '/'}`}
        >
          {c('ui.immersive')}
        </a>
      </nav>
      <Dialog
        open={practiceOpen}
        onOpenChange={setPracticeOpen}
        onOpenChangeComplete={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="practice-dialog">
          {selected && (
            <>
              <Photo id={selected.image} alt="" />
              <div className="practice-dialog-copy">
                <span className="eyebrow">{selected.category}</span>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
