import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { DbModule } from '@db/db.module';

import { AuthController } from './auth.controller';
import { AuthService } from './infrastructure/auth.service';
import { PermissionModule } from './modules/permissions/permission.module';
import { RoleModule } from './modules/roles/role.module';
import { UserModule } from './modules/users/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [ConfigModule, DbModule, UserModule, RoleModule, PermissionModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy],
})
export class AuthModule {}
