import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { userMapper } from '@auth/modules/users/mappers/user.mapper';
import { InternalError } from '@common/errors/service-errors';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@db/repositories/user.repository';

import { JwtDto } from '../dto/in/jwt.dto';
import { LoginDto } from '../dto/in/login.dto';
import { LoginResponse } from '../dto/out/login.response';
import { User } from '../modules/users/domain/User';
import { AuthGateway } from './auth.gateway';

@Injectable()
export class AuthService implements AuthGateway {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  private async validateUser(email: string, password: string): Promise<User> {
    const userDto = await this.userRepository.getUserByEmail(email);
    if (userDto) {
      const user = userMapper.fromDto.toDomain(userDto);
      const correctPassword = await bcrypt.compare(
        password,
        user.getProps().password,
      );
      if (correctPassword) {
        user.sanitize();
        return user;
      }
    }
    throw new UnauthorizedException('Invalid login credentials.');
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    try {
      const { email, password } = dto;
      const user = await this.validateUser(email, password);
      const { id } = user.getProps();
      const payload: JwtDto = {
        id,
        email,
        permissions: user.getPermissions(),
      };
      return {
        accessToken: this.jwtService.sign(payload, {
          secret: process.env.AUTH_SECRET,
        }),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Unexpected error while signing in: ${error}`);
      throw new InternalError('signing in');
    }
  }
}
