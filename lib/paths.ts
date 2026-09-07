export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(
  /\/$/,
  '',
);
export const asset = (path: string) => `${basePath}${path}`;
export const pagePath = (
  edition: string,
  page = 'home',
  locale: 'en' | 'es-LA' = 'en',
) =>
  `${basePath}/${edition}/${locale === 'es-LA' ? 'es-LA/' : ''}${page === 'home' ? '' : page + '/'}`;
