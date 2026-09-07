'use client';
import { useEffect } from 'react';

// Native cross-document transitions preserve browser navigation and history.
// Browsers without that API use a short exit/entry dissolve for internal links.
export function PageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const native = 'onpageswap' in window && 'onpagereveal' in window;
    root.dataset.pageMotion = native ? 'native' : 'fallback';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let timer = 0;
    const reset = () => {
      clearTimeout(timer);
      delete root.dataset.leaving;
    };
    const internal = (target: EventTarget | null) => {
      const link = target instanceof Element ? target.closest('a[href]') : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target ||
        link.hasAttribute('download')
      )
        return;
      const url = new URL(link.href);
      if (
        url.origin !== location.origin ||
        !/\/(classic|immersive)(\/|$)/.test(url.pathname)
      )
        return;
      if (url.pathname === location.pathname && url.search === location.search)
        return;
      return url;
    };
    const prefetched = new Set<string>();
    const prefetch = (event: Event) => {
      const url = internal(event.target);
      if (!url || prefetched.has(url.href) || prefetched.size >= 12) return;
      prefetched.add(url.href);
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url.href;
      document.head.appendChild(link);
    };
    const leave = (event: MouseEvent) => {
      if (
        native ||
        reduced.matches ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const url = internal(event.target);
      if (!url) return;
      event.preventDefault();
      if (root.dataset.leaving) return;
      root.dataset.leaving = 'true';
      timer = window.setTimeout(() => location.assign(url.href), 220);
    };
    window.addEventListener('pageshow', reset);
    document.addEventListener('click', leave);
    document.addEventListener('pointerover', prefetch, { passive: true });
    document.addEventListener('focusin', prefetch);
    return () => {
      reset();
      window.removeEventListener('pageshow', reset);
      document.removeEventListener('click', leave);
      document.removeEventListener('pointerover', prefetch);
      document.removeEventListener('focusin', prefetch);
    };
  }, []);
  return null;
}
