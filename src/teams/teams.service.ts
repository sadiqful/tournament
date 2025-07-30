import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, TeamStatus } from '../entities/team.entity';
import { Player } from '../entities/player.entity';
import { Payment } from '../entities/payment.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    // Check if team name already exists
    const existingTeam = await this.teamRepository.findOne({
      where: { name: createTeamDto.name }
    });

    if (existingTeam) {
      throw new BadRequestException('Team name already exists');
    }

    const team = this.teamRepository.create(createTeamDto);
    return this.teamRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      relations: ['players', 'payment'],
      where: { status: TeamStatus.APPROVED }
    });
  }

  async findAllForAdmin(): Promise<Team[]> {
    return this.teamRepository.find({
      relations: ['players', 'payment'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['players', 'payment']
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);
    Object.assign(team, updateTeamDto);
    return this.teamRepository.save(team);
  }

  async updateStatus(id: string, status: TeamStatus): Promise<Team> {
    const team = await this.findOne(id);
    team.status = status;
    return this.teamRepository.save(team);
  }

  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
  }

  async getTeamStats() {
    const total = await this.teamRepository.count();
    const approved = await this.teamRepository.count({ where: { status: TeamStatus.APPROVED } });
    const pending = await this.teamRepository.count({ where: { status: TeamStatus.PENDING } });
    const rejected = await this.teamRepository.count({ where: { status: TeamStatus.REJECTED } });
    const paidTeams = await this.teamRepository.count({ where: { paymentComplete: true } });

    return {
      total,
      approved,
      pending,
      rejected,
      paidTeams
    };
  }
}