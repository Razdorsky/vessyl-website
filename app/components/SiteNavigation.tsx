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
import { asset, basePath } from '../../lib/paths';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const href = (p = 'home') =>
    `${basePath}/${edition}/${p === 'home' ? '' : `${p}/`}`;
  const jointLogo =
    ['stay', 'rancho', 'contact'].includes(page) ||
    (edition === 'immersive' && page === 'home');
  const spaces = [
    ['dome', 'The Dome', 'dome-exterior'],
    ['hearth', 'Harmonic Hearth', 'hearth'],
    ['nature', 'Equine & Nature', 'equine'],
    ['stay', 'AKEN Soul', 'pool'],
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
    if (edition !== 'classic') return;
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
      Download App
    </a>
  );
  const bookAction = (
    <a className="nav-book" href={BOOKING} target="_blank" rel="noreferrer">
      Book a stay <ArrowUpRight size={15} />
    </a>
  );
  return (
    <header className="site-header" role="banner" ref={header}>
      <a href={href()} className="brand" aria-label="Vessyl home">
        <img
          src={asset(
            jointLogo ? '/brand/logo-aken-white.svg' : '/brand/logo-white.svg',
          )}
          alt="Vessyl"
          width="176"
          height="35"
        />
      </a>
      <nav className="desktop-navigation" aria-label="Main navigation">
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
          The Experience <ChevronDown size={14} />
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
                    `/images/${edition === 'classic' ? classicNavigationPhoto(id, photo) : photo}-thumb.webp`,
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
            Overview <ArrowUpRight size={16} />
          </a>
        </div>
        <a
          href={href('founder')}
          aria-current={page === 'founder' ? 'page' : undefined}
        >
          The Founder
        </a>
        <a
          href={href('sessions')}
          aria-current={page === 'sessions' ? 'page' : undefined}
        >
          Sessions
        </a>
        <a
          href={href('press')}
          aria-current={page === 'press' ? 'page' : undefined}
        >
          Press
        </a>
      </nav>
      <div className="header-actions">
        {appAction}
        {bookAction}
      </div>
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogTrigger className="menu-toggle" aria-label="Open navigation">
          <Menu />
        </DialogTrigger>
        <DialogContent
          className={`menu-dialog ${edition === 'classic' ? 'classic-controls' : ''} translate-x-0 translate-y-0`}
        >
          <DialogTitle className="sr-only">Vessyl navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Choose a page to explore.
          </DialogDescription>
          <div className="menu-dialog-body">
            <a
              href={href()}
              className={`mobile-brand ${jointLogo ? 'joint-mobile' : ''}`}
              aria-label="Vessyl home"
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
            <nav aria-label="Mobile navigation">
              <Accordion
                defaultValue={['experience']}
                className="mobile-experience"
              >
                <AccordionItem value="experience">
                  <AccordionTrigger>The Experience</AccordionTrigger>
                  <AccordionContent className="mobile-experience-links">
                    {spaces.map(([id, label]) => (
                      <a href={href(id)} key={id}>
                        {label}
                      </a>
                    ))}
                    <a href={href('experience')}>
                      Overview <ArrowUpRight size={14} />
                    </a>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <a href={href('founder')}>The Founder</a>
              <a href={href('sessions')}>Sessions</a>
              <a href={href('press')}>Press</a>
            </nav>
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
