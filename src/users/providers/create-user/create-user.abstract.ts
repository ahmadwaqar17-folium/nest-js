import { CreateUserDto } from '../../dto/create-user.dto';
import { User } from '../../entities/user.entity';

export abstract class CreateUserProvider {
  abstract createUser(createUserDto: CreateUserDto): Promise<User>;
}
