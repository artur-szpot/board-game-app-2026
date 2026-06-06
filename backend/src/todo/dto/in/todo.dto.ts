import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;
}
