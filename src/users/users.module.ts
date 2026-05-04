import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './providers/users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { CreateUserProvider } from './providers/create-user/create-user.abstract';
import { CreateUserService } from './providers/create-user/create-user/create-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: CreateUserProvider,
      useClass: CreateUserService,
    },
  ],
  exports: [UsersService, CreateUserProvider],
})
export class UsersModule {}
