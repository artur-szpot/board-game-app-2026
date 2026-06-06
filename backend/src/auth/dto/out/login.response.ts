import { IsNotEmpty, IsString } from 'class-validator';

export class LoginResponse {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
