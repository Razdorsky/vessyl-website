import entries from './approved-copy.json';
export type CopyKey = keyof typeof entries;
export const copy = (key: CopyKey) => entries[key].text;
export { entries as copyEvidence };
