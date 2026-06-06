import { Body, Controller, Post } from '@nestjs/common';

import { LoginDto } from './dto/in/login.dto';
import { LoginResponse } from './dto/out/login.response';
import { AuthService } from './infrastructure/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  // post register

  // whatever is needed for google or other oauth
}
