import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
  import { PlayersService } from './players.service';
  import { CreatePlayerDto } from './dto/create-player.dto';
  import { UpdatePlayerDto } from './dto/update-player.dto';
  import { CreateBulkPlayersDto } from './dto/create-bulk-players.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { PlayerPosition } from '../entities/player.entity';
  
  @ApiTags('Players')
  @Controller('players')
  export class PlayersController {
    constructor(private readonly playersService: PlayersService) {}
  
    @Post()
    @ApiOperation({ summary: 'Add a new player' })
    @UseInterceptors(FileInterceptor('photo'))
    async create(
      @Body() createPlayerDto: CreatePlayerDto,
      @UploadedFile() photo?: Express.Multer.File
    ) {
      if (photo) {
        createPlayerDto.photo = photo.filename;
      }
      return this.playersService.create(createPlayerDto);
    }
  
    @Post('bulk')
    @ApiOperation({ summary: 'Add multiple players at once' })
    async createBulk(@Body() createBulkPlayersDto: CreateBulkPlayersDto) {
      return this.playersService.createBulk(createBulkPlayersDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all players' })
    @ApiQuery({ name: 'position', required: false, enum: PlayerPosition })
    async findAll(@Query('position') position?: PlayerPosition) {
      if (position) {
        return this.playersService.findByPosition(position);
      }
      return this.playersService.findAll();
    }
  
    @Get('team/:teamId')
    @ApiOperation({ summary: 'Get players by team' })
    async findByTeam(@Param('teamId') teamId: string) {
      return this.playersService.findByTeam(teamId);
    }
  
    @Get('stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get player statistics (admin only)' })
    async getStats() {
      return this.playersService.getPlayerStats();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get player by ID' })
    async findOne(@Param('id') id: string) {
      return this.playersService.findOne(id);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update player (admin only)' })
    @UseInterceptors(FileInterceptor('photo'))
    async update(
      @Param('id') id: string,
      @Body() updatePlayerDto: UpdatePlayerDto,
      @UploadedFile() photo?: Express.Multer.File
    ) {
      if (photo) {
        updatePlayerDto.photo = photo.filename;
      }
      return this.playersService.update(id, updatePlayerDto);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete player (admin only)' })
    async remove(@Param('id') id: string) {
      return this.playersService.remove(id);
    }
  }
  