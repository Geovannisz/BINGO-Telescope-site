export type Lang = 'pt' | 'en' | 'zh-CN' | 'zh';

export interface TranslatedContent<T> {
  data: T;
  isTranslated: boolean;
  missingLang: string | null;
}

/**
 * Merges the base Portuguese content with the requested language translations.
 * If the language is not Portuguese and no translations exist, it returns the base content
 * and sets isTranslated to false.
 */
export function getTranslatedContent<T extends Record<string, any>>(
  entryData: T,
  lang: Lang
): TranslatedContent<T> {
  const normalizedLang = lang === 'zh' || lang === 'zh-CN' ? 'zh' : lang;

  if (normalizedLang === 'pt') {
    return { data: entryData, isTranslated: true, missingLang: null };
  }

  const translationData = entryData[normalizedLang];

  // Check if translationData exists and has at least one non-empty string value
  const hasTranslation = translationData && Object.values(translationData).some(
    (val) => typeof val === 'string' && val.trim() !== ''
  );

  if (hasTranslation) {
    // Merge base data with translations (ignoring empty translation strings)
    const mergedData = { ...entryData };
    for (const [key, value] of Object.entries(translationData)) {
      if (typeof value === 'string' && value.trim() !== '') {
        (mergedData as any)[key] = value;
      }
    }
    return { data: mergedData, isTranslated: true, missingLang: null };
  }

  // Missing translation
  const langNames = { en: 'English', zh: '中文 (Chinese)' };
  return { 
    data: entryData, 
    isTranslated: false, 
    missingLang: langNames[normalizedLang as keyof typeof langNames] || normalizedLang
  };
}
