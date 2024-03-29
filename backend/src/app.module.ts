/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuthGuard,
  KeycloakConnectModule,
  RoleGuard,
} from 'nest-keycloak-connect';
import { Connection } from 'mongoose';
import * as toJson from '@meanie/mongoose-to-json';
import { APP_GUARD } from '@nestjs/core';
import { TileModule } from './tiles/tile.module';
import { MapModule } from './maps/map.module';
import { ObstacleModule } from './obstacle/obstacle.module';
import { CategoryModule } from './category/category.module';
import { AdminModule } from './admin';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: validationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        connectionFactory: (connection: Connection) => {
          return connection.plugin(toJson);
        },
      }),
      inject: [ConfigService],
    }),
    KeycloakConnectModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        authServerUrl: configService.get<string>('KEYCLOAK_URI'),
        realm: configService.get<string>('KEYCLOAK_REALM'),
        clientId: configService.get<string>('KEYCLOAK_CLIENT_ID'),
        secret: configService.get<string>('KEYCLOAK_SECRET'),
      }),
      inject: [ConfigService],
    }),
    AdminModule,
    TileModule,
    MapModule,
    ObstacleModule,
    CategoryModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  controllers: [],
})
export class AppModule {}
