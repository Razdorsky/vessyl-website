import type { CopyKey } from './copy';
export type World =
  | 'arrival'
  | 'dome'
  | 'hearth'
  | 'forest'
  | 'portrait'
  | 'gallery';
export type Chapter = {
  title: CopyKey;
  body: CopyKey[];
  image: string;
  world: World;
  to?: string;
  action?: CopyKey;
};
export const containedChapter = (ch: Chapter) =>
  ch.world === 'portrait' ||
  ch.world === 'gallery' ||
  [
    'equine',
    'equine-bond',
    'pool',
    'table',
    'dining',
    'meditation',
    'yoga',
    'dome-practice',
  ].includes(ch.image);
const chapter = (
  title: CopyKey,
  body: CopyKey[],
  image: string,
  world: World,
  to?: string,
  action: CopyKey = 'learn',
): Chapter => ({ title, body, image, world, to, action });
export const journeys: Record<string, Chapter[]> = {
  home: [
    chapter(
      'homeHeadline',
      ['homeShort'],
      'hero-arenal',
      'arrival',
      'experience',
      'discover',
    ),
    chapter(
      'founder',
      ['founderIntro', 'founderWhy'],
      'founder',
      'portrait',
      'founder',
      'founderCta',
    ),
    chapter('dome', ['domeIntro'], 'dome-exterior', 'dome', 'dome'),
    chapter('hearth', ['hearthIntro'], 'hearth', 'hearth', 'hearth'),
    chapter('nature', ['natureIntro'], 'equine', 'forest', 'nature'),
    chapter('stay', ['stayIntro'], 'pool', 'arrival', 'stay', 'bookStay'),
    chapter(
      'appHeadline',
      ['appIntro'],
      'dome-practice',
      'gallery',
      'app',
      'download',
    ),
  ],
  founder: [
    chapter('founder', ['founderIntro'], 'founder', 'portrait'),
    chapter(
      'quoteAuthor',
      ['founderStory', 'founderQuestion'],
      'nature',
      'forest',
    ),
    chapter(
      'home',
      ['founderNext'],
      'dome-exterior',
      'dome',
      'experience',
      'discover',
    ),
  ],
  experience: [
    chapter('experience', ['homeShort'], 'hero-arenal', 'arrival'),
    chapter('dome', ['domeIntro'], 'dome-interior', 'dome', 'dome'),
    chapter('hearth', ['hearthIntro'], 'hearth', 'hearth', 'hearth'),
    chapter('nature', ['natureIntro'], 'equine', 'forest', 'nature'),
    chapter('stay', ['stayIntro'], 'pool', 'arrival', 'stay'),
  ],
  dome: [
    chapter('dome', ['domeIntro'], 'dome-exterior', 'arrival'),
    chapter('technology', ['soundIntro'], 'dome-interior', 'dome'),
    chapter('video', ['videoIntro'], 'dome-practice', 'dome'),
    chapter('floor', ['floorIntro'], 'dome-interior', 'dome'),
    chapter(
      'studio',
      ['studioIntro', 'studioDetail'],
      'dome-detail',
      'gallery',
      'music',
      'musicCta',
    ),
  ],
  hearth: [
    chapter('hearth', ['hearthIntro'], 'hearth', 'hearth'),
    chapter('hydro', ['hydroIntro'], 'nature-waterfall', 'hearth'),
    chapter(
      'breathwork',
      ['breathworkIntro'],
      'yoga',
      'gallery',
      'sessions',
      'sessionCta',
    ),
  ],
  nature: [
    chapter('nature', ['natureIntro'], 'equine-bond', 'forest'),
    chapter('horseBond', ['bondIntro', 'enriqueIntro'], 'equine', 'gallery'),
    chapter('river', ['riverIntro'], 'equine-bond', 'forest'),
    chapter('birdwatching', ['birdIntro'], 'nature', 'forest'),
    chapter('natureWalk', ['pathIntro'], 'nature', 'forest'),
  ],
  sessions: [
    chapter('sessions', ['guidesIntro'], 'massage', 'gallery'),
    chapter('quantum', ['quantumIntro'], 'session', 'gallery', 'quantum'),
    chapter('wellness', ['breathworkIntro'], 'yoga', 'dome', 'wellness'),
  ],
  quantum: [
    chapter('quantum', ['quantumIntro'], 'session', 'gallery'),
    chapter('numerology', ['numerologyIntro'], 'meditation', 'dome'),
  ],
  wellness: [
    chapter('wellness', ['guidesIntro'], 'massage', 'gallery'),
    chapter('breathwork', ['breathworkIntro'], 'yoga', 'dome'),
    chapter('hearth', ['hearthIntro'], 'hearth', 'hearth'),
  ],
  facilitators: [
    chapter('facilitators', ['guidesIntro'], 'session', 'gallery'),
    chapter('enrique', ['enriqueIntro'], 'equine', 'forest'),
    chapter('oscar', ['birdIntro'], 'nature', 'forest'),
  ],
  stay: [
    chapter('stay', ['stayIntro'], 'pool', 'arrival'),
    chapter('rooms', [], 'suite', 'gallery'),
    chapter('roomConcept', [], 'villa', 'gallery'),
    chapter('rancho', ['ranchoIntro'], 'table', 'forest', 'rancho'),
  ],
  rancho: [
    chapter('rancho', ['ranchoSoul'], 'dining', 'gallery'),
    chapter('culinary', ['ranchoIntro', 'chefIntro'], 'food', 'gallery'),
    chapter('rancho', ['tableIntro', 'ranchoRitual'], 'table', 'forest'),
  ],
  app: [
    chapter('appHeadline', ['appIntro'], 'dome-practice', 'dome'),
    chapter('appDoor', ['appStory'], 'nature', 'forest'),
    chapter('appLibrary', ['appLibraryIntro'], 'meditation', 'gallery'),
    chapter(
      'appGuides',
      ['appGuidesIntro'],
      'session',
      'gallery',
      'facilitators',
      'guidesCta',
    ),
  ],
  music: [
    chapter('music', ['musicIntro'], 'dome-interior', 'dome'),
    chapter(
      'studio',
      ['studioIntro', 'studioDetail'],
      'dome-detail',
      'gallery',
    ),
  ],
  press: [
    chapter('press', ['homeShort'], 'hero-arenal', 'arrival'),
    chapter('overview', ['homeIntro', 'founderIntro'], 'founder', 'portrait'),
  ],
  contact: [chapter('contact', ['locationIntro'], 'hero-arenal', 'arrival')],
  faq: [chapter('faq', ['homeShort'], 'nature', 'forest')],
};
