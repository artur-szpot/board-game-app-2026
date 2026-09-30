import { Inject, Injectable, Logger } from '@nestjs/common';

import { CustomInternalError } from '@common/errors/service-errors';
import {
    TRANSLATION_REPOSITORY,
    TranslationRepository,
} from '@db/repositories/translation.repository';

import { TranslationLookupDto } from '../dto/in/translation-lookup.dto';
import { TranslationLookupResponse } from '../dto/out/translation-lookup.response';

export const FALLBACK_LANGUAGE = 'en';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  constructor(
    @Inject(TRANSLATION_REPOSITORY)
    private readonly repository: TranslationRepository,
  ) {}

  public async lookup(
    dto: TranslationLookupDto,
  ): Promise<TranslationLookupResponse> {
    const keys = [...new Set(dto.keys)];
    try {
      const rows = await this.repository.getTranslations(
        keys,
        dto.language,
        FALLBACK_LANGUAGE,
      );
      const translations = Object.fromEntries(
        rows.map((row) => [row.label, row.value]),
      );
      return {
        translations,
        missing: keys.filter((key) => !(key in translations)),
      };
    } catch (error) {
      this.logger.error(
        `Unexpected error while looking up translations: ${error}`,
      );
      throw new CustomInternalError('looking up translations');
    }
  }
}
