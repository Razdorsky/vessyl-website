// Derive progress from actual chapter bounds; long copy can change chapter heights.
export function journeyPosition(track: HTMLElement) {
  const chapters = Array.from(
    track.querySelectorAll<HTMLElement>(':scope > .journey-chapter'),
  );
  const bounds = track.getBoundingClientRect();
  const distance = Math.max(0, -bounds.top);
  let index = chapters.findIndex(
    (ch) => distance < ch.offsetTop + ch.offsetHeight,
  );
  if (index < 0) index = chapters.length - 1;
  const chapter = chapters[index];
  const progress = chapter
    ? index + Math.max(0, (distance - chapter.offsetTop) / chapter.offsetHeight)
    : 0;
  return {
    progress: Math.min(progress, chapters.length - 0.28),
    bounds,
    chapters,
  };
}
