import { Injectable, NotFoundException, ConflictException, RequestTimeoutException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { DataSource } from 'typeorm';
import { PaginationQueryDto } from '../../common/pagination/dtos/pagination_query.dto.js';
import { PaginatedResponse } from '../../common/pagination/interfaces/paginated-response.interface.js';
import { buildPaginationMeta } from '../../common/pagination/helpers/pagination.helper.js';
import { CreateUserProvider } from './create-user/create-user.abstract';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    @Inject(CreateUserProvider)
    private readonly createUserProvider: CreateUserProvider,
  ) { }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<User>> {
    const limit = query.limit ?? 10;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;

    const [data, total] = await this.usersRepository.findAndCount({
      skip,
      take: limit,
    });

    return {
      data,
      meta: buildPaginationMeta(total, page, limit, '/users'),
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const updatedUser = Object.assign(user, updateUserDto);
    try {
      return await this.usersRepository.save(updatedUser);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    let existingUser;

    try {
      existingUser = await this.usersRepository.findOneBy({ id });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.delete(id);
  }
  //mock data 
  async createbulkuser(): Promise<User[]> {
    const users = [
      { name: 'Ali Khan', email: 'al2i.khan3@example.com' },
      { name: 'Ahmed Raza', email: 'ah2med.r3aza@example.com' },
      { name: 'Sara Ahmed', email: 'sa2ra.ahm3ed@example.com' },
      { name: 'Fatima Noor', email: 'fa2tima.n3oor@example.com' },
      { name: 'Usman Tariq', email: 'us2man.tar3iq@example.com' },
    ];

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdUsers: User[] = [];

      for (const user of users) {
        const newUser = queryRunner.manager.create(User, user);
        const savedUser = await queryRunner.manager.save(newUser);
        createdUsers.push(savedUser);
      }

      await queryRunner.commitTransaction();

      return createdUsers;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
