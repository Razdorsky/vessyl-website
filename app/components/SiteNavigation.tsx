'use client';
import { classicNavigationPhoto } from '../../lib/classic-photography';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, ArrowUpRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../../components/ui/dialog';
import { BOOKING } from '../../lib/content';
import { asset, pagePath } from '../../lib/paths';
import { useLocale } from './LocaleProvider';
import { LanguageSelector } from './LanguageSelector';
import { headerTone } from '../../lib/header-theme';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/ui/accordion';

// Figma Website 548:977; user revision puts Experience before Founder.
// App stores are not supplied: the Download App entry leads to the honest app-status page.
export function SiteNavigation({
  edition,
  page,
}: {
  edition: 'classic' | 'immersive';
  page: string;
}) {
  const { c, locale } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const href = (p = 'home') => pagePath(edition, p, locale);
  const jointLogo = ['stay', 'rancho', 'contact'].includes(page);
  const spaces = [
    ['dome', c('navDome'), 'dome-exterior'],
    ['hearth', c('hearth'), 'hearth'],
    ['nature', c('navNature'), 'equine'],
    ['stay', c('stay'), 'pool'],
  ];
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node))
        setExperienceOpen(false);
    };
    const focusOutside = (event: FocusEvent) => {
      if (!header.current?.contains(event.target as Node))
        setExperienceOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        header.current?.querySelector(
          '.experience-trigger[aria-expanded="true"]',
        )
      ) {
        setExperienceOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', focusOutside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', focusOutside);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  useEffect(() => {
    const breakpoint = window.matchMedia('(max-width: 1200px)');
    const closeMenus = () => {
      setMobileOpen(false);
      setExperienceOpen(false);
    };
    breakpoint.addEventListener('change', closeMenus);
    return () => breakpoint.removeEventListener('change', closeMenus);
  }, [edition]);
  const appAction = (
    <a className="nav-download" href={href('app')}>
      {c('download')}
    </a>
  );
  const bookAction = (
    <a className="nav-book" href={BOOKING} target="_blank" rel="noreferrer">
      {c('bookStay')} <ArrowUpRight size={15} />
    </a>
  );
  return (
    <header
      className="site-header"
      role="banner"
      data-header-tone={headerTone(edition, page)}
      ref={header}
    >
      <a href={href()} className="brand" aria-label={c('ui.homeLink')}>
        <img
          src={asset(
            jointLogo ? '/brand/logo-aken-white.svg' : '/brand/logo-white.svg',
          )}
          alt="Vessyl"
          width="176"
          height="35"
        />
      </a>
      <nav className="desktop-navigation" aria-label={c('ui.mainNavigation')}>
        <button
          className="experience-trigger"
          ref={trigger}
          aria-expanded={experienceOpen}
          aria-controls="experience-menu"
          onClick={() => setExperienceOpen(!experienceOpen)}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowDown') return;
            event.preventDefault();
            setExperienceOpen(true);
            requestAnimationFrame(() =>
              header.current
                ?.querySelector<HTMLAnchorElement>('#experience-menu a')
                ?.focus(),
            );
          }}
        >
          {c('navExperience')} <ChevronDown size={14} />
        </button>
        <div
          id="experience-menu"
          className="experience-mega"
          data-open={experienceOpen}
          aria-hidden={!experienceOpen}
          inert={!experienceOpen}
        >
          {spaces.map(([id, label, photo]) => (
            <a
              href={href(id)}
              key={id}
              aria-current={page === id ? 'page' : undefined}
            >
              <div className="mega-image">
                <img
                  src={asset(
                    `/images/${classicNavigationPhoto(id, photo)}-thumb.webp`,
                  )}
                  alt=""
                  width="800"
                  height="600"
                />
              </div>
              <span className="mega-label">{label}</span>
            </a>
          ))}
          <a href={href('experience')} className="mega-index">
            {c('ui.overview')} <ArrowUpRight size={16} />
          </a>
        </div>
        <a
          href={href('founder')}
          aria-current={page === 'founder' ? 'page' : undefined}
        >
          {c('founder')}
        </a>
        <a
          href={href('sessions')}
          aria-current={page === 'sessions' ? 'page' : undefined}
        >
          {c('navSessions')}
        </a>
        <a
          href={href('press')}
          aria-current={page === 'press' ? 'page' : undefined}
        >
          {c('navPress')}
        </a>
      </nav>
      <div className="header-actions">
        <LanguageSelector edition={edition} page={page} />
        {appAction}
        {bookAction}
      </div>
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogTrigger className="menu-toggle" aria-label={c('ui.menu')}>
          <Menu />
        </DialogTrigger>
        <DialogContent
          closeLabel={c('ui.close')}
          className={`menu-dialog classic-controls translate-x-0 translate-y-0`}
        >
          <DialogTitle className="sr-only">
            {c('ui.navigationTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {c('ui.navigationDescription')}
          </DialogDescription>
          <div className="menu-dialog-body">
            <a
              href={href()}
              className={`mobile-brand ${jointLogo ? 'joint-mobile' : ''}`}
              aria-label={c('ui.homeLink')}
            >
              <img
                src={asset(
                  jointLogo
                    ? '/brand/logo-aken-white.svg'
                    : '/brand/logo-dark.svg',
                )}
                alt="Vessyl"
                width="160"
                height="32"
              />
            </a>
            <nav aria-label={c('ui.mobileNavigation')}>
              <Accordion
                defaultValue={['experience']}
                className="mobile-experience"
              >
                <AccordionItem value="experience">
                  <AccordionTrigger>{c('navExperience')}</AccordionTrigger>
                  <AccordionContent className="mobile-experience-links">
                    {spaces.map(([id, label]) => (
                      <a href={href(id)} key={id}>
                        {label}
                      </a>
                    ))}
                    <a href={href('experience')}>
                      {c('ui.overview')} <ArrowUpRight size={14} />
                    </a>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <a href={href('founder')}>{c('founder')}</a>
              <a href={href('sessions')}>{c('navSessions')}</a>
              <a href={href('press')}>{c('navPress')}</a>
            </nav>
            <LanguageSelector edition={edition} page={page} mobile />
            <div className="mobile-actions">
              {bookAction}
              {appAction}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
