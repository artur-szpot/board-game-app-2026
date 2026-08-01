import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'player_one' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'player@example.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'correct-horse-battery-staple' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
