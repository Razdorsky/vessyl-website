'use client';
import { Popover } from '@base-ui/react/popover';
import { Globe2, ChevronDown, Check } from 'lucide-react';
import { useLocale } from './LocaleProvider';
import { pagePath } from '../../lib/paths';
import type { Locale } from '../../lib/copy';

export function LanguageSelector({
  edition,
  page,
  mobile = false,
}: {
  edition: string;
  page: string;
  mobile?: boolean;
}) {
  const { locale, c } = useLocale();
  return (
    <div
      className={`language-selector${mobile ? ' language-selector-mobile' : ''}`}
    >
      {mobile && <span className="language-label">{c('ui.language')}</span>}
      <Popover.Root>
        <Popover.Trigger
          className="language-trigger"
          aria-label={`${c('ui.chooseLanguage')}: ${locale === 'en' ? 'English' : 'Español'}`}
        >
          <Globe2 size={19} strokeWidth={1.5} aria-hidden="true" />
          <span>{locale === 'en' ? 'EN' : 'ES'}</span>
          <ChevronDown
            className="language-chevron"
            size={12}
            aria-hidden="true"
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner
            side="bottom"
            align="end"
            sideOffset={10}
            className="language-positioner"
          >
            <Popover.Popup
              className="language-popover"
              aria-label={c('ui.language')}
              lang={locale === 'es-LA' ? 'es-419' : 'en'}
            >
              {(['en', 'es-LA'] as Locale[]).map((option) => (
                <a
                  key={option}
                  href={pagePath(edition, page, option)}
                  hrefLang={option === 'en' ? 'en' : 'es-419'}
                  lang={option === 'en' ? 'en' : 'es-419'}
                  aria-current={locale === option ? 'true' : undefined}
                >
                  <span>{option === 'en' ? 'English' : 'Español'}</span>
                  {locale === option && (
                    <Check size={16} strokeWidth={1.5} aria-hidden="true" />
                  )}
                </a>
              ))}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
