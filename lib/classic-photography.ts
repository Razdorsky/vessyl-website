import photography from './classic-photography.json';

const pages: Record<string, Record<string, string>> = photography.pages;
const navigation: Record<string, string> = photography.navigation;
const assets: Record<string, { alt: string; objectPosition: string }> =
  photography.assets;

/** Photos belong to an editorial placement, independent of the shared copy. */
export const classicPhoto = (page: string, slot: string, fallback: string) =>
  pages[page]?.[slot] ?? fallback;

export const classicNavigationPhoto = (space: string, fallback: string) =>
  navigation[space] ?? fallback;

export const photoMetadata = (id: string) => assets[id];
