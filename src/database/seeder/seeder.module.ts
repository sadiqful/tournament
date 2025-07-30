import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeederService } from './seeder.service';
import { Admin } from '../../entities/admin.entity';
import { Team } from '../../entities/team.entity';
import { Player } from '../../entities/player.entity';
import { Match } from '../../entities/match.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Admin, Team, Player, Match]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}