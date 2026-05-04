import { Module, forwardRef } from '@nestjs/common';
import { Hashing } from './providers/hashing/hashing';
import { Bcrypt } from './providers/bcrypt/bcrypt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from './guards/access-token.guard';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('jwt');
        return {
          secret: config.secret,
          signOptions: {
            expiresIn: config.accessTokenTtl,
            audience: config.audience,
            issuer: config.issuer,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: Hashing,
      useClass: Bcrypt,
    },
    AuthService,
    AccessTokenGuard,
  ],
  exports: [Hashing, AuthService, AccessTokenGuard, JwtModule],
})
export class AuthModule {}
