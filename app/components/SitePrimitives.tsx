'use client';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Plus,
  Pause,
  Play,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/ui/accordion';
import { asset } from '../../lib/paths';
import { copy as c } from '../../lib/copy';
import { Heading } from './Typography';
import imageDimensions from '../../lib/image-dimensions.json';
const picture = (id: string, small = false) =>
  asset(`/images/${id}${small ? '-thumb' : ''}.webp`);
// Descriptive image alternatives are interface accessibility copy, not marketing prose.
const imageAlts: Record<string, string> = {
  'hero-arenal': 'Arenal Volcano beyond the Vessyl pool',
  'dome-exterior': 'The Frequency Dome in the Costa Rican landscape',
  'dome-interior': 'A group resting inside the Frequency Dome',
  'dome-detail': 'A plant beside the copper-clad Dome',
  'dome-practice': 'A group practice inside the Frequency Dome',
  equine: 'A participant with a horse at Vessyl',
  'equine-bond': 'A participant beside a horse',
  nature: 'Rainforest foliage',
  'nature-waterfall': 'A garden waterfall at Vessyl',
  pool: 'Guests beside the pool overlooking Arenal',
  table: 'Guests sharing a table overlooking Arenal',
  dining: 'A meal being served at Vessyl',
  food: 'A plated meal prepared at Vessyl',
  founder: 'Josh Stanley, founder of Vessyl',
  hearth: 'The circular interior of the Harmonic Hearth',
  massage: 'An outdoor bodywork session',
  session: 'A practitioner and participant in a session',
  meditation: 'A seated meditation inside the Dome',
  yoga: 'A group yoga practice inside the Dome',
  suite: 'A Pulse Suite bedroom',
  'suite-view': 'A bedroom overlooking the surrounding greenery',
  villa: 'A Pulse Villa with an outdoor pool',
  'villa-living': 'The living area of a Pulse Villa',
  'villa-kitchen': 'The kitchen of a Pulse Villa',
};
export function Photo({
  id,
  alt = '',
  className = '',
  eager = false,
}: {
  id: string;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  const dimensions = imageDimensions[id as keyof typeof imageDimensions];
  return (
    <img
      className={className}
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
        eager
          ? '100vw'
          : '(max-width: 560px) 100vw, (max-width: 1000px) 60vw, 50vw'
      }
      alt={alt ? imageAlts[id] || alt : ''}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
    />
  );
}
export function LinkArrow({
  href,
  children,
  button = false,
  light = false,
  external = false,
}: {
  href: string;
  children: ReactNode;
  button?: boolean;
  light?: boolean;
  external?: boolean;
}) {
  return (
    <a
      className={button ? `button ${light ? 'cream' : 'forest'}` : 'text-link'}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
      <ArrowUpRight size={18} />
    </a>
  );
}
export function Pattern({
  kind = 'lattice',
}: {
  kind?: 'lattice' | 'wave' | 'fans';
}) {
  return (
    <div
      aria-hidden="true"
      className={`brand-pattern pattern-${kind}`}
      style={{
        maskImage: `url(${asset(`/brand/patterns/${kind}.svg`)})`,
        WebkitMaskImage: `url(${asset(`/brand/patterns/${kind}.svg`)})`,
      }}
    />
  );
}
export function Gallery({
  images,
  title = c('gallery'),
}: {
  images: { id: string; caption: string }[];
  title?: string;
}) {
  const [index, setIndex] = useState(0),
    [open, setOpen] = useState(false);
  return (
    <section className="gallery section">
      <div className="section-heading">
        <Heading text={title} />
      </div>
      <div className="gallery-grid">
        {images.map((item, i) => (
          <button
            className="gallery-item"
            key={item.id}
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            aria-label={`View ${item.caption}`}
          >
            <Photo id={item.id} alt={item.caption} />
            <span>
              {item.caption}
              <Plus size={20} />
            </span>
          </button>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gallery-dialog">
          <DialogTitle className="sr-only">{images[index].caption}</DialogTitle>
          <DialogDescription className="sr-only">
            Photographs of Vessyl. Use the previous and next buttons to explore.
          </DialogDescription>
          <div className="gallery-stage">
            {images.map((item, i) => (
              <div
                className="gallery-slide"
                key={item.id}
                data-active={index === i}
                aria-hidden={index !== i}
              >
                <Photo id={item.id} alt={item.caption} eager />
              </div>
            ))}
          </div>
          <div className="gallery-controls">
            <button
              aria-label="Previous photograph"
              onClick={() =>
                setIndex((index - 1 + images.length) % images.length)
              }
            >
              <ArrowLeft />
            </button>
            <span aria-live="polite">
              {images[index].caption}{' '}
              <small>
                {index + 1} / {images.length}
              </small>
            </span>
            <button
              aria-label="Next photograph"
              onClick={() => setIndex((index + 1) % images.length)}
            >
              <ArrowRight />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
export function Film({ autoPlay = false }: { autoPlay?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    let visible = false;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const syncPlayback = () => {
      if (!visible || document.hidden || reducedMotion.matches) el.pause();
      else if (autoPlay && !userPaused.current)
        el.play().catch(() => setPlaying(false));
    };
    const obs = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting && e.intersectionRatio >= 0.15;
        syncPlayback();
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    reducedMotion.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      obs.disconnect();
      reducedMotion.removeEventListener('change', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, [autoPlay]);
  return (
    <div className="film">
      <video
        ref={video}
        poster={asset('/images/hero-ambient-poster.webp')}
        loop
        muted
        playsInline
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={asset('/images/hero-ambient.mp4')} type="video/mp4" />
      </video>
      <button
        className="film-play"
        onClick={() => {
          userPaused.current = playing;
          if (playing) video.current?.pause();
          else video.current?.play().catch(() => setPlaying(false));
        }}
        aria-label={playing ? 'Pause Vessyl film' : 'Play Vessyl film'}
      >
        {playing ? <Pause /> : <Play />}
        <span>
          {playing ? c('ui.pauseFilm') : c('ui.film')}
          <small>12 s · {c('ui.filmSound')}</small>
        </span>
      </button>
    </div>
  );
}
export function FaqList({
  items,
  headingLevel = 3,
}: {
  items: string[][];
  headingLevel?: 2 | 3;
}) {
  return (
    <Accordion className="faq-list">
      {items.map(([q, a], i) => (
        <AccordionItem key={q} value={String(i)}>
          <AccordionTrigger headingLevel={headingLevel}>{q}</AccordionTrigger>
          <AccordionContent>
            <p>{a}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
