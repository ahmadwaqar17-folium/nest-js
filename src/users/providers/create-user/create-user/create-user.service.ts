import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { CreateUserDto } from '../../../dto/create-user.dto';
import { CreateUserProvider } from '../create-user.abstract';
import { BadRequestException, RequestTimeoutException } from '@nestjs/common';
import { Hashing } from '../../../../auth/providers/hashing/hashing';

@Injectable()
export class CreateUserService extends CreateUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(Hashing)
    private readonly hashing: Hashing,
  ) {
    super();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    let existingUser: User | null = null;

    try {
      existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
    } catch (error) {
      throw new RequestTimeoutException('Failed to check existing user');
    }

    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }

    const hashedPassword = await this.hashing.hashPassword(createUserDto.password);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.usersRepository.save(newUser);
  }
}
