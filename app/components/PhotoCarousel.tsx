'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Photo } from './Photo';
import { useLocale } from './LocaleProvider';
import imageDimensions from '../../lib/image-dimensions.json';

export type GalleryImage = { id: string; caption: string };

export function PhotoCarousel({
  images,
  label,
  variant = 'room',
  initialIndex = 0,
  active = true,
  onIndexChange,
}: {
  images: GalleryImage[];
  label: string;
  variant?: 'room' | 'lightbox';
  initialIndex?: number;
  active?: boolean;
  onIndexChange?: (index: number) => void;
}) {
  const { c } = useLocale();
  const [start] = useState(initialIndex);
  const scope = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [viewport, api] = useEmblaCarousel({
    loop: images.length > 1,
    startIndex: start,
    duration: 28,
    breakpoints: { '(prefers-reduced-motion: reduce)': { duration: 0 } },
  });
  const syncSelection = useCallback(() => {
    if (!api) return;
    const next = api.selectedScrollSnap();
    setIndex(next);
    onIndexChange?.(next);
  }, [api, onIndexChange]);
  useEffect(() => {
    if (!api) return;
    api.on('select', syncSelection).on('reInit', syncSelection);
    return () => {
      api.off('select', syncSelection).off('reInit', syncSelection);
    };
  }, [api, syncSelection]);
  const previous = useCallback(() => {
    if (api?.canScrollPrev()) api.scrollPrev();
    else api?.scrollTo(images.length - 1);
  }, [api, images.length]);
  const next = useCallback(() => {
    if (api?.canScrollNext()) api.scrollNext();
    else api?.scrollTo(0);
  }, [api]);
  const handleKey = useCallback(
    (event: globalThis.KeyboardEvent) => {
      if (
        !active ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      if (
        variant === 'room' &&
        (!(event.target instanceof Node) ||
          !scope.current?.contains(event.target))
      )
        return;
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('input,textarea,select,[contenteditable="true"]')
      )
        return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
        return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'ArrowLeft') previous();
      else if (event.key === 'ArrowRight') next();
      else api?.scrollTo(event.key === 'Home' ? 0 : images.length - 1);
    },
    [active, previous, next, api, images.length, variant],
  );
  useEffect(() => {
    // A lightbox owns these keys even while focus is on its close button.
    // Inline room galleries only handle keys while focus is within the carousel.
    if (!active) return;
    // Base UI stops composite keys at the dialog boundary. Capture the scoped
    // carousel keys first, leaving Escape, Tab and unrelated page controls alone.
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [variant, active, handleKey]);

  if (!images.length) return null;
  const dimensions =
    imageDimensions[images[index].id as keyof typeof imageDimensions];
  return (
    <section
      ref={scope}
      className={`photo-carousel photo-carousel-${variant}`}
      aria-label={label}
      aria-roledescription={c('ui.photoCarousel')}
      data-index={index}
      style={
        {
          '--photo-height-ratio': dimensions
            ? dimensions.height / dimensions.width
            : 2 / 3,
        } as CSSProperties
      }
    >
      <div className="photo-carousel-viewport" ref={viewport}>
        <div className="photo-carousel-track">
          {images.map((item, i) => (
            <div
              className="photo-carousel-slide"
              key={item.id}
              aria-hidden={i !== index}
            >
              <Photo
                id={item.id}
                alt={i === index ? item.caption : ''}
                eager={variant === 'lightbox'}
                sizes="(max-width: 820px) 95vw, 70vw"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button
              className="photo-edge photo-edge-previous"
              type="button"
              aria-label={c('ui.previous')}
              onClick={previous}
            >
              <span>
                <ArrowLeft size={21} aria-hidden="true" />
              </span>
            </button>
            <button
              className="photo-edge photo-edge-next"
              type="button"
              aria-label={c('ui.next')}
              onClick={next}
            >
              <span>
                <ArrowRight size={21} aria-hidden="true" />
              </span>
            </button>
          </>
        )}
      </div>
      {variant === 'lightbox' && (
        <div
          className="photo-carousel-caption"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{images[index].caption}</span>
          <small>
            {index + 1} / {images.length}
          </small>
        </div>
      )}
      {images.length > 1 && (
        <div className="photo-thumbnails">
          {images.map((item, i) => (
            <button
              type="button"
              key={item.id}
              aria-label={`${c('ui.view')} ${item.caption} (${i + 1} / ${images.length})`}
              aria-pressed={index === i}
              onClick={() => api?.scrollTo(i)}
            >
              <Photo id={item.id} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
