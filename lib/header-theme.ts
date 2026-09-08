/** The header, document canvas and browser theme must use this shared palette. */
export const headerColors = { dark: '#111111', warm: '#311500' } as const;
export const headerTone = (edition: string, page: string) =>
  edition === 'immersive' || page === 'home' ? 'warm' : 'dark';
export const headerColor = (edition: string, page: string) =>
  headerColors[headerTone(edition, page)];
