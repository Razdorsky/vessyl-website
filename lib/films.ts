/** Every film uses the same playback component and controls. */
export const films = {
  main: {
    source: '/videos/main.mp4',
    poster: '/videos/main-poster.webp',
  },
  founder: {
    source: '/videos/founder.mp4',
    poster: '/videos/founder-poster.webp',
  },
  sessions: {
    source: '/videos/sessions.mp4',
    poster: '/videos/sessions-poster.webp',
  },
  music: {
    source: '/images/hero-ambient.mp4',
    poster: '/images/hero-ambient-poster.webp',
  },
} as const;
