import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { userMapper } from '@auth/modules/users/mappers/user.mapper';
import { CustomInternalError } from '@common/errors/service-errors';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@db/repositories/user.repository';
import {
  ROLE_REPOSITORY,
  RoleRepository,
} from '@db/repositories/role.repository';

import { JwtDto } from '../dto/in/jwt.dto';
import { LoginDto } from '../dto/in/login.dto';
import { SignupDto } from '../dto/in/signup.dto';
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
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
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
    }
    throw new CustomInternalError('signing in');
  }

  async signup(dto: SignupDto): Promise<LoginResponse> {
    try {
      const { username, email, password } = dto;

      // Check if user already exists
      const existingUserByEmail =
        await this.userRepository.getUserByEmail(email);
      if (existingUserByEmail) {
        throw new BadRequestException('E-mail address already in use');
      }

      const existingUserByUsername =
        await this.userRepository.getUserByUsername(username);
      if (existingUserByUsername) {
        throw new BadRequestException('Selected username is already in use');
      }

      // Get the default 'user' role
      const userRole = await this.roleRepository.getRoleByName('User');
      if (!userRole) {
        throw new CustomInternalError('getting default user role');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUserDto = await this.userRepository.createUser({
        username,
        email,
        password: hashedPassword,
        roles: [{ roleId: userRole.id }],
      });

      // Convert to domain user and get permissions
      const user = userMapper.fromDto.toDomain(newUserDto);
      user.sanitize();
      const { id } = user.getProps();
      const permissions = user.getPermissions();

      // Generate JWT token
      const payload: JwtDto = {
        id,
        email,
        permissions,
      };

      return {
        accessToken: this.jwtService.sign(payload, {
          secret: process.env.AUTH_SECRET,
        }),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error while signing up: ${error}`);
      throw new CustomInternalError('signing up');
    }
  }
}
