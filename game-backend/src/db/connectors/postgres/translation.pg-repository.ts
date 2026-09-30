import { Injectable } from '@nestjs/common';

import {
    TranslationRepository,
    TranslationRow,
} from '../../repositories/translation.repository';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresTranslationRepository implements TranslationRepository {
  private readonly SELECT_TRANSLATIONS_SQL = `
    SELECT DISTINCT ON (label) label, value
    FROM translations
    WHERE label = ANY($1) AND language IN ($2, $3)
    ORDER BY label, (language = $2) DESC;
  `;

  constructor(private readonly connector: PostgresConnector) {}

  public async getTranslations(
    labels: string[],
    language: string,
    fallbackLanguage: string,
  ): Promise<TranslationRow[]> {
    if (labels.length === 0) {
      return [];
    }
    return this.connector.getMany<TranslationRow>(
      this.SELECT_TRANSLATIONS_SQL,
      [labels, language, fallbackLanguage],
    );
  }
}
