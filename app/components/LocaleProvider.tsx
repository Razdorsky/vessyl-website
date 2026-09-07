'use client';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { copy, translateText, type Locale, type CopyKey } from '../../lib/copy';

const LocaleContext = createContext<Locale>('en');
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale === 'es-LA' ? 'es-419' : 'en';
  }, [locale]);
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}
export function useLocale() {
  const locale = useContext(LocaleContext);
  return {
    locale,
    c: (key: CopyKey) => copy(key, locale),
    t: (text: string) => translateText(text, locale),
  };
}
