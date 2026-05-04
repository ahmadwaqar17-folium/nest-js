import { Injectable, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/providers/users.service';
import { Hashing } from './providers/hashing/hashing';
import { SignInDto } from './dtos/signin.dto';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(Hashing)
    private readonly hashing: Hashing,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(signInDto: SignInDto) {
    let user: User | null = null;

    try {
      user = await this.usersService.findByEmail(signInDto.email);
    } catch (error) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await this.hashing.comparePassword(
      signInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const jwtConfiguration = this.configService.get('jwt');

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        audience: jwtConfiguration.audience,
        issuer: jwtConfiguration.issuer,
        secret: jwtConfiguration.secret,
        expiresIn: jwtConfiguration.accessTokenTtl,
      }
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
      },
      {
        audience: jwtConfiguration.audience,
        issuer: jwtConfiguration.issuer,
        secret: jwtConfiguration.secret,
        expiresIn: jwtConfiguration.refreshTokenTtl,
      }
    );

    return { 
      access_token: accessToken,
      refresh_token: refreshToken 
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('jwt').secret,
        audience: this.configService.get('jwt').audience,
        issuer: this.configService.get('jwt').issuer,
      });

      const user = await this.usersService.findOne(payload.sub);

      const jwtConfiguration = this.configService.get('jwt');

      const accessToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          audience: jwtConfiguration.audience,
          issuer: jwtConfiguration.issuer,
          secret: jwtConfiguration.secret,
          expiresIn: jwtConfiguration.accessTokenTtl,
        }
      );

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }
}
