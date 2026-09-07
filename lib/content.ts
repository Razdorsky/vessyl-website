import { copy, type CopyKey } from './copy';
import faqKeys from './approved-faq.json';
export const BOOKING = 'https://akenhotels.com/en/vessyl-home/';
export const WAITLIST = 'https://thevessyl.com/waitlist';
export const EMAIL = 'guestservices@thevessyl.com';
export const pageTitles: Record<string, string> = Object.fromEntries(
  [
    'home',
    'founder',
    'experience',
    'dome',
    'hearth',
    'nature',
    'sessions',
    'quantum',
    'wellness',
    'facilitators',
    'stay',
    'rancho',
    'app',
    'music',
    'press',
    'contact',
    'faq',
  ].map((key) => [key, copy(key as CopyKey)]),
);
export const pageKeys = Object.keys(pageTitles);
export const experiences = [
  {
    id: 'dome',
    name: copy('navDome'),
    image: 'dome-exterior',
    number: '01',
    body: copy('domeIntro'),
  },
  {
    id: 'hearth',
    name: copy('hearth'),
    image: 'hearth',
    number: '02',
    body: copy('hearthIntro'),
  },
  {
    id: 'nature',
    name: copy('navNature'),
    image: 'equine',
    number: '03',
    body: copy('natureIntro'),
  },
  {
    id: 'stay',
    name: copy('stay'),
    image: 'pool',
    number: '04',
    body: copy('stayIntro'),
  },
];
export type Practice = {
  id: string;
  title: string;
  category: 'Quantum' | 'Wellness';
  image: string;
  intro: string;
  body: string;
  detail: string;
};
export const practices: Practice[] = [
  ['chakra', 'chakra', 'Quantum', 'dome-interior', 'chakraIntro'],
  ['planet', 'planet', 'Quantum', 'dome-interior', 'planetIntro'],
  ['worlds', 'worlds', 'Quantum', 'dome-interior', 'worldsIntro'],
  ['vibrational-yoga', 'vibrational', 'Wellness', 'yoga', 'vibrationalIntro'],
  ['mobility', 'mobility', 'Wellness', 'meditation', 'mobilityIntro'],
  ['hearth', 'hearth', 'Wellness', 'nature-waterfall', 'hearthIntro'],
  ['bodywork', 'bodyTreatments', 'Wellness', 'massage', 'bodyTreatmentsIntro'],

  ['quantum-self', 'soul', 'Quantum', 'session', 'quantumIntro'],
  ['numerology', 'numerology', 'Quantum', 'meditation', 'numerologyIntro'],
  ['breathwork', 'breathwork', 'Wellness', 'meditation', 'breathworkIntro'],
  ['yoga-nidra', 'nidra', 'Wellness', 'dome-practice', 'nidraIntro'],
  ['qi-chai', 'qi', 'Wellness', 'nature', 'qiIntro'],
  ['hydro', 'hydro', 'Wellness', 'nature-waterfall', 'hydroIntro'],

  ['fractals', 'fractals', 'Quantum', 'dome-interior', 'fractalsIntro'],
  ['voices', 'voices', 'Quantum', 'dome-interior', 'voicesIntro'],
]
  .sort(
    (a, b) =>
      [
        'quantum-self',
        'numerology',
        'chakra',
        'planet',
        'fractals',
        'voices',
        'worlds',
        'breathwork',
        'vibrational-yoga',
        'yoga-nidra',
        'mobility',
        'qi-chai',
        'hydro',
        'hearth',
        'bodywork',
      ].indexOf(a[0]) -
      [
        'quantum-self',
        'numerology',
        'chakra',
        'planet',
        'fractals',
        'voices',
        'worlds',
        'breathwork',
        'vibrational-yoga',
        'yoga-nidra',
        'mobility',
        'qi-chai',
        'hydro',
        'hearth',
        'bodywork',
      ].indexOf(b[0]),
  )
  .map(([id, title, category, image, body]) => ({
    id,
    title: copy(title as CopyKey),
    category: category as 'Quantum' | 'Wellness',
    image,
    intro: copy(body as CopyKey),
    body: copy(body as CopyKey),
    detail: '',
  }));
export const faqs = faqKeys.map(([q, a]) => [
  copy(q as CopyKey),
  copy(a as CopyKey),
]);
