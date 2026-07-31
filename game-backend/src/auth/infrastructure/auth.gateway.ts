import { LoginDto } from '../dto/in/login.dto';
import { LoginResponse } from '../dto/out/login.response';

export interface AuthGateway {
  login(dto: LoginDto): Promise<LoginResponse>;
}
