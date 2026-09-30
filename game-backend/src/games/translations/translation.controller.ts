import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import {
    HttpErrorResponseDto,
    ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { TranslationLookupDto } from './dto/in/translation-lookup.dto';
import { TranslationLookupResponse } from './dto/out/translation-lookup.response';
import { TranslationService } from './infrastructure/translation.service';

@ApiTags('Translations')
@ApiBearerAuth('access-token')
@ApiBadRequestResponse({ type: ValidationErrorResponseDto })
@ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
@Controller('game-api/translations')
@UseGuards(JwtAuthGuard)
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post('lookup')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Resolve translation keys for a language, falling back to English per key',
  })
  @ApiBody({ type: TranslationLookupDto })
  @ApiOkResponse({ type: TranslationLookupResponse })
  lookup(
    @Body() input: TranslationLookupDto,
  ): Promise<TranslationLookupResponse> {
    return this.translationService.lookup(input);
  }
}
