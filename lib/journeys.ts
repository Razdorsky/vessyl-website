import type { CopyKey } from './copy';
import { classicPhoto } from './classic-photography';
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
  heading?: 'h3';
  contained?: boolean;
};
export const containedChapter = (ch: Chapter) =>
  ch.contained ?? (ch.world === 'portrait' || ch.world === 'gallery');
const chapter = (
  title: CopyKey,
  body: CopyKey[],
  image: string,
  world: World,
  to?: string,
  action: CopyKey = 'learn',
): Chapter => ({ title, body, image, world, to, action });
const photo = classicPhoto;
// The camera journeys have their own composition, but use the current approved copy and photo selections.
export const journeys: Record<string, Chapter[]> = {
  home: [
    chapter(
      'homeHeadline',
      ['homeApproach'],
      photo('home', 'hero', 'hero-design-direction'),
      'arrival',
      'experience',
      'discover',
    ),
    {
      ...chapter('homeShort', ['homeOrigins'], 'dome-exterior', 'forest'),
      heading: 'h3',
    },
    chapter(
      'founder',
      ['founderWhy'],
      photo('home', 'portrait', 'founder'),
      'portrait',
      'founder',
      'founderCta',
    ),
    chapter(
      'dome',
      ['domeIntro'],
      photo('home', 'dome-feature', 'dome-design-direction'),
      'dome',
      'dome',
    ),
    chapter(
      'hearth',
      ['hearthIntro'],
      photo('home', 'experience:hearth', 'hearth'),
      'hearth',
      'hearth',
    ),
    chapter(
      'nature',
      ['natureIntro'],
      photo('home', 'experience:nature', 'equine'),
      'portrait',
      'nature',
    ),
    chapter(
      'stay',
      ['stayAccommodation'],
      photo('home', 'experience:stay', 'pool'),
      'gallery',
      'stay',
    ),
    chapter(
      'rancho',
      ['ranchoIntro'],
      photo('home', 'story:rancho', 'food'),
      'gallery',
      'rancho',
    ),
  ],
  founder: [
    chapter(
      'founder',
      ['founderOpening'],
      photo('founder', 'hero', 'nature'),
      'forest',
    ),
    chapter(
      'quoteAuthor',
      ['founderProfileLead', 'founderBrothers'],
      'founder',
      'portrait',
    ),
  ],
  experience: [
    chapter(
      'experience',
      ['homeShort'],
      photo('experience', 'hero', 'hero-arenal'),
      'arrival',
    ),
    chapter(
      'dome',
      ['domeIntro'],
      photo('experience', 'experience:dome', 'dome-exterior'),
      'dome',
      'dome',
    ),
    chapter(
      'hearth',
      ['hearthIntro'],
      photo('experience', 'experience:hearth', 'hearth'),
      'hearth',
      'hearth',
    ),
    chapter(
      'nature',
      ['natureIntro'],
      photo('experience', 'experience:nature', 'equine'),
      'portrait',
      'nature',
    ),
    chapter(
      'stay',
      ['stayIntro'],
      photo('experience', 'experience:stay', 'pool'),
      'gallery',
      'stay',
    ),
    chapter(
      'rancho',
      ['ranchoSoul'],
      photo('experience', 'story:rancho', 'table'),
      'gallery',
      'rancho',
    ),
  ],
  dome: [
    chapter(
      'dome',
      ['domeIntro'],
      photo('dome', 'hero', 'dome-exterior'),
      'dome',
    ),
    chapter(
      'technology',
      ['soundIntro', 'videoIntro', 'floorIntro'],
      photo('dome', 'technology', 'dome-detail'),
      'gallery',
    ),
  ],
  hearth: [
    chapter(
      'hearth',
      ['hearthIntro'],
      photo('hearth', 'hero', 'hearth'),
      'hearth',
    ),
    chapter(
      'hydro',
      ['hydroIntro'],
      photo('hearth', 'hydro', 'nature-waterfall'),
      'hearth',
    ),
  ],
  nature: [
    chapter(
      'nature',
      ['natureIntro'],
      photo('nature', 'hero', 'equine-bond'),
      'portrait',
    ),
    chapter(
      'horseBond',
      ['bondIntro', 'enriqueIntro'],
      photo('nature', 'story:horseBond', 'equine'),
      'portrait',
    ),
    chapter(
      'river',
      ['riverIntro'],
      photo('nature', 'gallery:1', 'nature-waterfall'),
      'forest',
    ),
    chapter(
      'birdwatching',
      ['birdIntro'],
      photo('nature', 'story:birdwatching', 'nature'),
      'gallery',
    ),
    chapter(
      'natureWalk',
      ['pathIntro'],
      photo('nature', 'story:natureWalk', 'nature'),
      'forest',
    ),
  ],
  sessions: [
    {
      ...chapter(
        'sessions',
        ['guidesIntro'],
        photo('sessions', 'hero', 'massage'),
        'gallery',
      ),
      contained: false,
    },
  ],
  quantum: [
    chapter(
      'quantum',
      ['quantumOpening'],
      photo('quantum', 'hero', 'session'),
      'gallery',
    ),
  ],
  wellness: [
    chapter(
      'wellness',
      ['guidesIntro'],
      photo('wellness', 'hero', 'massage'),
      'gallery',
    ),
  ],
  facilitators: [
    chapter(
      'facilitators',
      ['guidesIntro'],
      photo('facilitators', 'hero', 'session'),
      'gallery',
    ),
    chapter(
      'enrique',
      ['enriqueIntro'],
      photo('facilitators', 'guide:Enrique Molina', 'equine'),
      'portrait',
    ),
    chapter(
      'oscar',
      ['birdIntro'],
      photo('facilitators', 'guide:Oscar', 'nature'),
      'forest',
    ),
  ],
  stay: [
    chapter('stay', ['stayIntro'], photo('stay', 'hero', 'pool'), 'arrival'),
    chapter(
      'rooms',
      ['stayAccommodation'],
      photo('stay', 'room:suite', 'suite'),
      'gallery',
    ),
    chapter(
      'rancho',
      ['ranchoIntro'],
      photo('stay', 'story:rancho', 'table'),
      'gallery',
      'rancho',
    ),
  ],
  rancho: [
    chapter(
      'rancho',
      ['ranchoSoul'],
      photo('rancho', 'hero', 'dining'),
      'gallery',
    ),
    chapter(
      'culinary',
      ['ranchoIntro', 'chefIntro'],
      photo('rancho', 'story:rancho', 'food'),
      'gallery',
    ),
  ],
  app: [
    chapter('appHeadline', ['appIntro'], 'dome-practice', 'dome'),
    chapter('appDoor', ['appStory'], 'nature', 'forest'),
  ],
  music: [
    chapter(
      'music',
      ['musicIntro'],
      photo('music', 'hero', 'dome-interior'),
      'dome',
    ),
    chapter(
      'studio',
      ['studioIntro', 'studioDetail'],
      photo('music', 'story:dome', 'dome-detail'),
      'gallery',
    ),
  ],
  press: [
    chapter('press', ['homeShort', 'homeOrigins'], 'hero-arenal', 'arrival'),
  ],
  contact: [
    chapter(
      'contact',
      ['locationIntro'],
      photo('contact', 'aside', 'hero-arenal'),
      'arrival',
    ),
  ],
  faq: [chapter('faq', [], 'nature', 'forest')],
};
