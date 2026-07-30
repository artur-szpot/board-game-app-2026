import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GetEntityByIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  id: string;
}
