import entries from './approved-copy.json';
import spanish from './locales/es-LA.json';
export type Locale = 'en' | 'es-LA';
export type CopyKey = keyof typeof entries;
const translated: Record<CopyKey, string> = spanish;
export const copy = (key: CopyKey, locale: Locale = 'en') =>
  locale === 'es-LA' ? translated[key] : entries[key].text;
const byEnglish = new Map(
  Object.entries(entries).map(([key, value]) => [value.text, key as CopyKey]),
);
export const translateText = (text: string, locale: Locale) => {
  const key = byEnglish.get(text);
  return key ? copy(key, locale) : text;
};
export { entries as copyEvidence };
