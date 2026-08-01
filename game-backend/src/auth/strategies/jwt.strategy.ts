import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtDto } from '@auth/dto/in/jwt.dto';
import { TokenRevocationService } from '@auth/infrastructure/token-revocation.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenRevocationService: TokenRevocationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('authSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any): Promise<JwtDto> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token && this.tokenRevocationService.isRevoked(token)) {
      throw new UnauthorizedException('Token has been invalidated');
    }

    return {
      id: payload.id,
      email: payload.email,
      permissions: payload.permissions,
    };
  }
}
