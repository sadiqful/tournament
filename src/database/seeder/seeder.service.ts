import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../../entities/admin.entity';
import { Team, TeamStatus } from '../../entities/team.entity';
import { Player, PlayerPosition } from '../../entities/player.entity';
import { Match, MatchStatus, MatchStage } from '../../entities/match.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private configService: ConfigService,
  ) {}

  async seedAdmin() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD is missing in environment variables');
    }

    const existingAdmin = await this.adminRepository.findOne({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const admin = this.adminRepository.create({
        email: adminEmail,
        password: hashedPassword,
      });

      await this.adminRepository.save(admin);
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  }

  async seedSampleTeams(): Promise<Team[]> {
    const existingTeams = await this.teamRepository.count();

    if (existingTeams === 0) {
      const sampleTeams: Partial<Team>[] = [
        {
          name: 'Manchester Eagles',
          coach: 'John Smith',
          description: 'A team of champions',
          contactEmail: 'eagles@example.com',
          contactPhone: '+234-801-111-1111',
          status: TeamStatus.APPROVED,
          paymentComplete: true,
        },
        {
          name: 'Barcelona Lions',
          coach: 'Maria Garcia',
          description: 'Strong and united',
          contactEmail: 'lions@example.com',
          contactPhone: '+234-801-222-2222',
          status: TeamStatus.APPROVED,
          paymentComplete: true,
        },
        {
          name: 'Chelsea Warriors',
          coach: 'David Johnson',
          description: 'Never give up',
          contactEmail: 'warriors@example.com',
          contactPhone: '+234-801-333-3333',
          status: TeamStatus.PENDING,
          paymentComplete: false,
        },
      ];

      const teams = this.teamRepository.create(sampleTeams);
      const savedTeams = await this.teamRepository.save(teams);

      console.log('✅ Sample teams created');
      return savedTeams;
    } else {
      console.log('ℹ️ Teams already exist');
      return this.teamRepository.find();
    }
  }

  async seedSamplePlayers(teams: Team[]) {
    const existingPlayers = await this.playerRepository.count();

    if (existingPlayers === 0 && teams.length >= 2) {
      const samplePlayers: Partial<Player>[] = [
        // Team 1
        { name: 'David Beckham', age: 28, position: PlayerPosition.MIDFIELDER, jerseyNumber: 7, teamId: teams[0].id },
        { name: 'Peter Schmeichel', age: 32, position: PlayerPosition.GOALKEEPER, jerseyNumber: 1, teamId: teams[0].id },
        { name: 'Ryan Giggs', age: 30, position: PlayerPosition.MIDFIELDER, jerseyNumber: 11, teamId: teams[0].id },
        { name: 'Wayne Rooney', age: 25, position: PlayerPosition.FORWARD, jerseyNumber: 10, teamId: teams[0].id },
        { name: 'Rio Ferdinand', age: 29, position: PlayerPosition.DEFENDER, jerseyNumber: 5, teamId: teams[0].id },
        // Team 2
        { name: 'Lionel Messi', age: 26, position: PlayerPosition.FORWARD, jerseyNumber: 10, teamId: teams[1].id },
        { name: 'Gerard Pique', age: 27, position: PlayerPosition.DEFENDER, jerseyNumber: 3, teamId: teams[1].id },
        { name: 'Andres Iniesta', age: 30, position: PlayerPosition.MIDFIELDER, jerseyNumber: 8, teamId: teams[1].id },
        { name: 'Xavi Hernandez', age: 34, position: PlayerPosition.MIDFIELDER, jerseyNumber: 6, teamId: teams[1].id },
        { name: 'Ter Stegen', age: 25, position: PlayerPosition.GOALKEEPER, jerseyNumber: 1, teamId: teams[1].id },
      ];

      const players = this.playerRepository.create(samplePlayers);
      await this.playerRepository.save(players);

      console.log('✅ Sample players created');
    } else {
      console.log('ℹ️ Players already exist or insufficient teams');
    }
  }

  async seedSampleMatches(teams: Team[]) {
    const existingMatches = await this.matchRepository.count();

    if (existingMatches === 0 && teams.length >= 2) {
      const sampleMatches: Partial<Match>[] = [
        {
          teamAId: teams[0].id,
          teamBId: teams[1].id,
          matchDate: new Date('2024-12-15T15:00:00Z'),
          venue: 'National Stadium, Lagos',
          stage: MatchStage.GROUP_STAGE,
          status: MatchStatus.SCHEDULED,
          notes: 'Group A - Match Day 1',
        },
        {
          teamAId: teams[1].id,
          teamBId: teams[0].id,
          matchDate: new Date('2024-12-22T18:00:00Z'),
          venue: 'Sports Complex, Abuja',
          stage: MatchStage.GROUP_STAGE,
          status: MatchStatus.COMPLETED,
          scoreA: 2,
          scoreB: 1,
          notes: 'Group A - Match Day 2',
        },
      ];

      const matches = this.matchRepository.create(sampleMatches);
      await this.matchRepository.save(matches);

      console.log('✅ Sample matches created');
    } else {
      console.log('ℹ️ Matches already exist or insufficient teams');
    }
  }

  async seedAll() {
    console.log('🌱 Starting database seeding...');

    try {
      await this.seedAdmin();
      const teams = await this.seedSampleTeams();
      await this.seedSamplePlayers(teams);
      await this.seedSampleMatches(teams);

      console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }
}
