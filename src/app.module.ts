import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { ResponseInterceptor } from './common/interceptors/response-data.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

const responseInterceptorProvider: Provider = {
  provide: APP_INTERCEPTOR,
  useClass: ResponseInterceptor,
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // Note: Set to false in production
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ProductsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, responseInterceptorProvider],
})
export class AppModule {}
