'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { asset } from '../../lib/paths';
import { useLocale } from './LocaleProvider';
import filmVersions from '../../lib/film-versions.json';
import { films } from '../../lib/films';

/** Every website film starts as a silent loop, then uses explicit playback. */
export function EditorialFilm({ name }: { name: keyof typeof films }) {
  const { c } = useLocale();
  const film = films[name];
  const video = useRef<HTMLVideoElement>(null);
  const opened = useRef(false);
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    let visible = false;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const syncPlayback = () => {
      if (!visible || document.hidden) el.pause();
      // Once opened, playback resumes only on another explicit tap.
      else if (!opened.current) {
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
    opened.current = true;
    setActivated(true);
    el.muted = false;
    setMuted(false);
    el.loop = false;
    el.currentTime = 0;
    el.play().catch(() => {});
  };

  const togglePlayback = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      if (el.ended) el.currentTime = 0;
      el.play().catch(() => {});
    } else el.pause();
  };

  return (
    <div className="editorial-film" data-film={name}>
      <video
        ref={video}
        width="1920"
        height="1080"
        poster={asset(`${film.poster}?v=${filmVersions[name]}`)}
        muted
        loop={!activated}
        playsInline
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onVolumeChange={() => setMuted(video.current?.muted ?? true)}
      >
        <source
          src={asset(`${film.source}?v=${filmVersions[name]}`)}
          type="video/mp4"
        />
      </video>
      <button
        type="button"
        className="editorial-film-action"
        aria-label={
          activated
            ? playing
              ? c('ui.pauseFilm')
              : c('ui.resumeFilm')
            : c('ui.filmFromStart')
        }
        onClick={activated ? togglePlayback : playFromStart}
      />
      {activated && (
        <fieldset
          className="editorial-film-controls"
          aria-label={c('ui.filmControls')}
        >
          <button
            type="button"
            aria-label={muted ? c('ui.unmuteFilm') : c('ui.muteFilm')}
            onClick={() => {
              const el = video.current;
              if (el) el.muted = !el.muted;
            }}
          >
            {muted ? (
              <VolumeX aria-hidden="true" />
            ) : (
              <Volume2 aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            aria-label={playing ? c('ui.pauseFilm') : c('ui.film')}
            onClick={togglePlayback}
          >
            {playing ? (
              <Pause aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
          </button>
        </fieldset>
      )}
    </div>
  );
}
