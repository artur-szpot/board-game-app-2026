import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { DbModule } from '@db/db.module';

import { AuthController } from './auth.controller';
import { AuthService } from './infrastructure/auth.service';
import { TokenRevocationService } from './infrastructure/token-revocation.service';
import { PermissionModule } from './modules/permissions/permission.module';
import { RoleModule } from './modules/roles/role.module';
import { AuthSearchModule } from './modules/search/auth-search.module';
import { UserModule } from './modules/users/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    DbModule,
    UserModule,
    RoleModule,
    PermissionModule,
    AuthSearchModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy, TokenRevocationService],
})
export class AuthModule {}
