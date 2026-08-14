import { IsBoolean } from 'class-validator';

export class CheckResultResponse {
  @IsBoolean()
  checkPassed: boolean;
}
