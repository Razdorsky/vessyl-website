'use client';
import { useState, useRef } from 'react';
import { Maximize2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { Heading } from './Typography';
import { useLocale } from './LocaleProvider';
import { Photo } from './Photo';
import { PhotoCarousel, type GalleryImage } from './PhotoCarousel';

export function Gallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title?: string;
}) {
  const { c } = useLocale();
  title ??= c('gallery');
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  if (!images.length) return null;
  return (
    <section className="gallery section">
      <div className="section-heading">
        <Heading text={title} />
      </div>
      <div className="gallery-stack">
        {images.slice(1, 3).map((_, i) => (
          <div
            className={`gallery-stack-back gallery-stack-back-${i + 1}`}
            key={i}
            aria-hidden="true"
          >
            <Photo
              id={images[(index + i + 1) % images.length].id}
              sizes="(max-width: 1100px) 90vw, 980px"
            />
          </div>
        ))}
        <button
          className="gallery-stack-front"
          ref={opener}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`${c('ui.view')} ${title}: ${images[index].caption}`}
        >
          <Photo
            id={images[index].id}
            alt={images[index].caption}
            sizes="(max-width: 1100px) 90vw, 980px"
          />
          <span className="gallery-stack-open" aria-hidden="true">
            <Maximize2 size={20} />
          </span>
        </button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="gallery-dialog"
          closeLabel={c('ui.close')}
          finalFocus={opener}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {c('ui.galleryDescription')}
          </DialogDescription>
          <PhotoCarousel
            images={images}
            label={title}
            variant="lightbox"
            initialIndex={index}
            onIndexChange={setIndex}
            active={open}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
