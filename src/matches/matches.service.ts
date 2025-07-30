import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus, MatchStage } from '../entities/match.entity';
import { Team, TeamStatus } from '../entities/team.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateMatchResultDto } from './dto/update-match-result.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    // Check if both teams exist and are approved
    const teamA = await this.teamRepository.findOne({
      where: { id: createMatchDto.teamAId }
    });
    const teamB = await this.teamRepository.findOne({
      where: { id: createMatchDto.teamBId }
    });

    if (!teamA || !teamB) {
      throw new NotFoundException('One or both teams not found');
    }

    if (teamA.status !== TeamStatus.APPROVED || teamB.status !== TeamStatus.APPROVED) {
      throw new BadRequestException('Both teams must be approved to schedule a match');
    }

    if (createMatchDto.teamAId === createMatchDto.teamBId) {
      throw new BadRequestException('A team cannot play against itself');
    }

    const match = this.matchRepository.create(createMatchDto);
    return this.matchRepository.save(match);
  }

  async findAll(): Promise<Match[]> {
    return this.matchRepository.find({
      relations: ['teamA', 'teamB'],
      order: { matchDate: 'ASC' }
    });
  }

  async findByStatus(status: MatchStatus): Promise<Match[]> {
    return this.matchRepository.find({
      where: { status },
      relations: ['teamA', 'teamB'],
      order: { matchDate: 'ASC' }
    });
  }

  async findByStage(stage: MatchStage): Promise<Match[]> {
    return this.matchRepository.find({
      where: { stage },
      relations: ['teamA', 'teamB'],
      order: { matchDate: 'ASC' }
    });
  }

  async findUpcoming(): Promise<Match[]> {
    return this.matchRepository.find({
      where: { status: MatchStatus.SCHEDULED },
      relations: ['teamA', 'teamB'],
      order: { matchDate: 'ASC' }
    });
  }

  async findResults(): Promise<Match[]> {
    return this.matchRepository.find({
      where: { status: MatchStatus.COMPLETED },
      relations: ['teamA', 'teamB'],
      order: { matchDate: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['teamA', 'teamB']
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match> {
    const match = await this.findOne(id);

    // If updating teams, validate them
    if (updateMatchDto.teamAId || updateMatchDto.teamBId) {
      const teamAId = updateMatchDto.teamAId || match.teamAId;
      const teamBId = updateMatchDto.teamBId || match.teamBId;

      if (teamAId === teamBId) {
        throw new BadRequestException('A team cannot play against itself');
      }

      const teamA = await this.teamRepository.findOne({ where: { id: teamAId } });
      const teamB = await this.teamRepository.findOne({ where: { id: teamBId } });

      if (!teamA || !teamB) {
        throw new NotFoundException('One or both teams not found');
      }

      if (teamA.status !== TeamStatus.APPROVED || teamB.status !== TeamStatus.APPROVED) {
        throw new BadRequestException('Both teams must be approved');
      }
    }

    Object.assign(match, updateMatchDto);
    return this.matchRepository.save(match);
  }

  async updateResult(id: string, updateResultDto: UpdateMatchResultDto): Promise<Match> {
    const match = await this.findOne(id);

    if (match.status === MatchStatus.COMPLETED) {
      throw new BadRequestException('Match result has already been recorded');
    }

    match.scoreA = updateResultDto.scoreA;
    match.scoreB = updateResultDto.scoreB;
    match.status = MatchStatus.COMPLETED;
    match.notes  = updateResultDto.notes;

    return this.matchRepository.save(match);
  }

  async updateStatus(id: string, status: MatchStatus): Promise<Match> {
    const match = await this.findOne(id);
    match.status = status;
    return this.matchRepository.save(match);
  }

  async remove(id: string): Promise<void> {
    const match = await this.findOne(id);
    await this.matchRepository.remove(match);
  }

  async getMatchStats() {
    const total = await this.matchRepository.count();
    const scheduled = await this.matchRepository.count({ 
      where: { status: MatchStatus.SCHEDULED } 
    });
    const live = await this.matchRepository.count({ 
      where: { status: MatchStatus.LIVE } 
    });
    const completed = await this.matchRepository.count({ 
      where: { status: MatchStatus.COMPLETED } 
    });

    const byStage = {
      groupStage: await this.matchRepository.count({ 
        where: { stage: MatchStage.GROUP_STAGE } 
      }),
      round16: await this.matchRepository.count({ 
        where: { stage: MatchStage.ROUND_16 } 
      }),
      quarterFinal: await this.matchRepository.count({ 
        where: { stage: MatchStage.QUARTER_FINAL } 
      }),
      semiFinal: await this.matchRepository.count({ 
        where: { stage: MatchStage.SEMI_FINAL } 
      }),
      final: await this.matchRepository.count({ 
        where: { stage: MatchStage.FINAL } 
      })
    };

    return {
      total,
      byStatus: { scheduled, live, completed },
      byStage
    };
  }

  async generateLeagueTable(): Promise<any[]> {
    const completedMatches = await this.matchRepository.find({
      where: { status: MatchStatus.COMPLETED },
      relations: ['teamA', 'teamB']
    });

    const teamsStats: { [key: string]: any } = {};

    // Initialize all approved teams
    const approvedTeams = await this.teamRepository.find({
      where: { status: TeamStatus.APPROVED }
    });

    approvedTeams.forEach(team => {
      teamsStats[team.id] = {
        team: team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      };
    });

    // Calculate stats from matches
    completedMatches.forEach(match => {
      const teamAId = match.teamAId;
      const teamBId = match.teamBId;
      const scoreA = match.scoreA;
      const scoreB = match.scoreB;

      if (teamsStats[teamAId] && teamsStats[teamBId]) {
        // Update played games
        teamsStats[teamAId].played++;
        teamsStats[teamBId].played++;

        // Update goals
        teamsStats[teamAId].goalsFor += scoreA;
        teamsStats[teamAId].goalsAgainst += scoreB;
        teamsStats[teamBId].goalsFor += scoreB;
        teamsStats[teamBId].goalsAgainst += scoreA;

        // Update goal difference
        teamsStats[teamAId].goalDifference = teamsStats[teamAId].goalsFor - teamsStats[teamAId].goalsAgainst;
        teamsStats[teamBId].goalDifference = teamsStats[teamBId].goalsFor - teamsStats[teamBId].goalsAgainst;

        // Determine result
        if (scoreA > scoreB) {
          // Team A wins
          teamsStats[teamAId].won++;
          teamsStats[teamAId].points += 3;
          teamsStats[teamBId].lost++;
        } else if (scoreB > scoreA) {
          // Team B wins
          teamsStats[teamBId].won++;
          teamsStats[teamBId].points += 3;
          teamsStats[teamAId].lost++;
        } else {
          // Draw
          teamsStats[teamAId].drawn++;
          teamsStats[teamAId].points += 1;
          teamsStats[teamBId].drawn++;
          teamsStats[teamBId].points += 1;
        }
      }
    });

    // Convert to array and sort by points, then goal difference, then goals for
    return Object.values(teamsStats).sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  }
}
