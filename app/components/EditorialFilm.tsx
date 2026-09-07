'use client';

import { useEffect, useRef } from 'react';
import { asset } from '../../lib/paths';

/** Approved, full-length films: a silent ambient loop until explicitly opened. */
export function EditorialFilm({
  name,
}: {
  name: 'main' | 'sessions' | 'founder';
}) {
  const video = useRef<HTMLVideoElement>(null);
  const requestedSound = useRef(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    let visible = false;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const syncPlayback = () => {
      if (!visible || document.hidden) el.pause();
      // Once opened with sound, playback resumes only on another explicit tap.
      else if (!requestedSound.current) {
        if (reducedMotion.matches) el.pause();
        else el.play().catch(() => {});
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        syncPlayback();
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    reducedMotion.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      el.pause();
      observer.disconnect();
      reducedMotion.removeEventListener('change', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, []);

  const playFromStart = () => {
    const el = video.current;
    if (!el) return;
    requestedSound.current = true;
    el.muted = false;
    el.loop = false;
    el.currentTime = 0;
    el.play().catch(() => {});
  };

  return (
    <div className="editorial-film" data-film={name}>
      <video
        ref={video}
        width="1920"
        height="1080"
        poster={asset(`/videos/${name}-poster.webp`)}
        muted
        loop
        playsInline
        preload="none"
      >
        <source src={asset(`/videos/${name}.mp4`)} type="video/mp4" />
      </video>
      <button
        type="button"
        className="editorial-film-action"
        aria-label="Play film from the beginning with sound"
        onClick={playFromStart}
      />
    </div>
  );
}
