import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player, PlayerPosition } from '../entities/player.entity';
import { Team, TeamStatus } from '../entities/team.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { CreateBulkPlayersDto } from './dto/create-bulk-players.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    // Check if team exists
    const team = await this.teamRepository.findOne({
      where: { id: createPlayerDto.teamId }
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if jersey number is already taken by another player in the same team
    const existingPlayer = await this.playerRepository.findOne({
      where: {
        teamId: createPlayerDto.teamId,
        jerseyNumber: createPlayerDto.jerseyNumber
      }
    });

    if (existingPlayer) {
      throw new BadRequestException('Jersey number already taken for this team');
    }

    // Check team player limit (15 players max)
    const playerCount = await this.playerRepository.count({
      where: { teamId: createPlayerDto.teamId }
    });

    if (playerCount >= 15) {
      throw new BadRequestException('Team already has maximum number of players (15)');
    }

    const player = this.playerRepository.create(createPlayerDto);
    return this.playerRepository.save(player);
  }

  async createBulk(createBulkPlayersDto: CreateBulkPlayersDto): Promise<Player[]> {
    const { teamId, players } = createBulkPlayersDto;

    // Check if team exists
    const team = await this.teamRepository.findOne({
      where: { id: teamId }
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if adding these players would exceed the limit
    const currentPlayerCount = await this.playerRepository.count({
      where: { teamId }
    });

    if (currentPlayerCount + players.length > 15) {
      throw new BadRequestException('Adding these players would exceed the team limit of 15 players');
    }

    // Check for duplicate jersey numbers within the request
    const jerseyNumbers = players.map(p => p.jerseyNumber);
    const duplicateJerseys = jerseyNumbers.filter((item, index) => jerseyNumbers.indexOf(item) !== index);
    
    if (duplicateJerseys.length > 0) {
      throw new BadRequestException(`Duplicate jersey numbers in request: ${duplicateJerseys.join(', ')}`);
    }

    // Check for existing jersey numbers in the team
    const existingPlayers = await this.playerRepository.find({
      where: { teamId },
      select: ['jerseyNumber']
    });

    const existingJerseys = existingPlayers.map(p => p.jerseyNumber);
    const conflictingJerseys = jerseyNumbers.filter(num => existingJerseys.includes(num));

    if (conflictingJerseys.length > 0) {
      throw new BadRequestException(`Jersey numbers already taken: ${conflictingJerseys.join(', ')}`);
    }

    // Create all players
    const newPlayers = players.map(playerData => 
      this.playerRepository.create({ ...playerData, teamId })
    );

    return this.playerRepository.save(newPlayers);
  }

  async findAll(): Promise<Player[]> {
    return this.playerRepository.find({
      relations: ['team'],
      where: { team: { status: TeamStatus.APPROVED } },
      order: { name: 'ASC' }
    });
  }

  async findByTeam(teamId: string): Promise<Player[]> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId }
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return this.playerRepository.find({
      where: { teamId },
      order: { jerseyNumber: 'ASC' }
    });
  }

  async findByPosition(position: PlayerPosition): Promise<Player[]> {
    return this.playerRepository.find({
      where: { position, team: { status: TeamStatus.APPROVED } },
      relations: ['team'],
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Player> {
    const player = await this.playerRepository.findOne({
      where: { id },
      relations: ['team']
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return player;
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const player = await this.findOne(id);

    // If jersey number is being updated, check for conflicts
    if (updatePlayerDto.jerseyNumber && updatePlayerDto.jerseyNumber !== player.jerseyNumber) {
      const existingPlayer = await this.playerRepository.findOne({
        where: {
          teamId: player.teamId,
          jerseyNumber: updatePlayerDto.jerseyNumber
        }
      });

      if (existingPlayer) {
        throw new BadRequestException('Jersey number already taken for this team');
      }
    }

    Object.assign(player, updatePlayerDto);
    return this.playerRepository.save(player);
  }

  async remove(id: string): Promise<void> {
    const player = await this.findOne(id);
    await this.playerRepository.remove(player);
  }

  async getPlayerStats() {
    const total = await this.playerRepository.count();
    const goalkeepers = await this.playerRepository.count({ 
      where: { position: PlayerPosition.GOALKEEPER } 
    });
    const defenders = await this.playerRepository.count({ 
      where: { position: PlayerPosition.DEFENDER } 
    });
    const midfielders = await this.playerRepository.count({ 
      where: { position: PlayerPosition.MIDFIELDER } 
    });
    const forwards = await this.playerRepository.count({ 
      where: { position: PlayerPosition.FORWARD } 
    });

    return {
      total,
      byPosition: {
        goalkeepers,
        defenders,
        midfielders,
        forwards
      }
    };
  }
}