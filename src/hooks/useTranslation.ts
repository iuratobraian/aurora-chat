import { useTranslation as useI18nTranslation } from 'react-i18next';

export interface UseTranslationReturn {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
}

export function useTranslation(namespace?: string): UseTranslationReturn {
  const { t, i18n } = useI18nTranslation(namespace);

  return {
    t: (key: string, params?: Record<string, string | number>) => {
      if (!key) return '';
      return t(key, params);
    },
    language: i18n.language,
  };
}
