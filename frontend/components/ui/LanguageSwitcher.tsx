'use client';

import React from 'react';
import { useLanguage, type Locale } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  /** Compact pill style (navbar) vs full card style (settings) */
  variant?: 'pill' | 'full';
}

const FLAG: Record<Locale, string> = { en: '🇺🇸', es: '🇪🇸' };
const LABEL: Record<Locale, string> = { en: 'EN', es: 'ES' };

export default function LanguageSwitcher({ variant = 'pill' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  const toggle = () => setLocale(locale === 'en' ? 'es' : 'en');

  if (variant === 'pill') {
    return (
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-white/60 hover:bg-white hover:shadow-md text-[10px] font-black uppercase tracking-widest text-foreground/70 hover:text-primary transition-all"
        title="Switch language"
        aria-label="Switch language"
      >
        <Globe size={12} />
        <span>{FLAG[locale]} {LABEL[locale]}</span>
      </button>
    );
  }

  // Full variant — two buttons side by side (used in Admin Settings)
  const options: Locale[] = ['en', 'es'];
  const fullLabel: Record<Locale, string> = { en: '🇺🇸 English', es: '🇪🇸 Español' };

  return (
    <div className="flex gap-3" role="group" aria-label="Language selector">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => setLocale(opt)}
          className={`flex-1 py-4 px-6 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all ${
            locale === opt
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
              : 'bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-primary'
          }`}
        >
          {fullLabel[opt]}
        </button>
      ))}
    </div>
  );
}
