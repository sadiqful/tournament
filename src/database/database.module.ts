import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Admin } from '../entities/admin.entity';
import { Team } from '../entities/team.entity';
import { Player } from '../entities/player.entity';
import { Match } from '../entities/match.entity';
import { Payment } from '../entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        ssl: {
          rejectUnauthorized: false,
        },
        autoLoadEntities: true,
        synchronize: true,
        entities: [Admin, Team, Player, Match, Payment],
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}