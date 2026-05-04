import { IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
