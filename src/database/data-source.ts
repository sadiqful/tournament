import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Admin } from '../entities/admin.entity';
import { Team } from '../entities/team.entity';
import { Player } from '../entities/player.entity';
import { Match } from '../entities/match.entity';
import { Payment } from '../entities/payment.entity';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  username: configService.get('DATABASE_USERNAME'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [Admin, Team, Player, Match, Payment],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
});