export type TranslationRow = { label: string; value: string };

export interface TranslationRepository {
  getTranslations(
    labels: string[],
    language: string,
    fallbackLanguage: string,
  ): Promise<TranslationRow[]>;
}

export const TRANSLATION_REPOSITORY = Symbol('TRANSLATION_REPOSITORY');
