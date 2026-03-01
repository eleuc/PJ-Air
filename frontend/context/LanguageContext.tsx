'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import en from '@/lib/i18n/en';
import es from '@/lib/i18n/es';
import type { Translations } from '@/lib/i18n/en';

export type Locale = 'en' | 'es';

const TRANSLATIONS: Record<Locale, Translations> = { en, es };

const DEFAULT_LOCALE_KEY = 'app_default_locale';
const USER_LOCALE_KEY = 'app_user_locale';

interface LanguageContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  /** Admin-only: sets default locale for ALL users (persisted in localStorage) */
  setDefaultLocale: (locale: Locale) => void;
  defaultLocale: Locale;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  t: en,
  setLocale: () => {},
  setDefaultLocale: () => {},
  defaultLocale: 'en',
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [defaultLocale, setDefaultLocaleState] = useState<Locale>('en');
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // 1. Read the admin-set default locale (fallback: 'en')
    const storedDefault = (localStorage.getItem(DEFAULT_LOCALE_KEY) as Locale) || 'en';
    setDefaultLocaleState(storedDefault);

    // 2. Read per-user preference (overrides default)
    const userPref = localStorage.getItem(USER_LOCALE_KEY) as Locale | null;
    setLocaleState(userPref || storedDefault);
  }, []);

  /** Change language for the current user session */
  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(USER_LOCALE_KEY, l);
  };

  /** Admin sets the default for everyone (new sessions / no personal pref) */
  const setDefaultLocale = (l: Locale) => {
    setDefaultLocaleState(l);
    localStorage.setItem(DEFAULT_LOCALE_KEY, l);
    // Apply immediately for current session too
    setLocale(l);
  };

  return (
    <LanguageContext.Provider
      value={{ locale, t: TRANSLATIONS[locale], setLocale, setDefaultLocale, defaultLocale }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
