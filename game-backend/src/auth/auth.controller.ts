import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  HttpErrorResponseDto,
  ValidationErrorResponseDto,
} from '@common/openapi/error-response.dto';
import { LoginDto } from './dto/in/login.dto';
import { SignupDto } from './dto/in/signup.dto';
import { LoginResponse } from './dto/out/login.response';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AuthService } from './infrastructure/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return access token' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: LoginResponse })
  @ApiBadRequestResponse({ type: ValidationErrorResponseDto })
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Create user account and return access token' })
  @ApiBody({ type: SignupDto })
  @ApiOkResponse({ type: LoginResponse })
  @ApiBadRequestResponse({ type: ValidationErrorResponseDto })
  @ApiConflictResponse({ type: HttpErrorResponseDto })
  async signup(@Body() signupDto: SignupDto): Promise<LoginResponse> {
    return this.authService.signup(signupDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Invalidate current JWT token' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
  async logout(@Headers('authorization') authHeader: string): Promise<void> {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    return this.authService.logout(token);
  }

  // whatever is needed for google or other oauth
}
