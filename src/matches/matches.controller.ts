import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
  import { MatchesService } from './matches.service';
  import { CreateMatchDto } from './dto/create-match.dto';
  import { UpdateMatchDto } from './dto/update-match.dto';
  import { UpdateMatchResultDto } from './dto/update-match-result.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { MatchStatus, MatchStage } from '../entities/match.entity';
  
  @ApiTags('Matches')
  @Controller('matches')
  export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new match (admin only)' })
    async create(@Body() createMatchDto: CreateMatchDto) {
      return this.matchesService.create(createMatchDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all matches' })
    @ApiQuery({ name: 'status', required: false, enum: MatchStatus })
    @ApiQuery({ name: 'stage', required: false, enum: MatchStage })
    async findAll(
      @Query('status') status?: MatchStatus,
      @Query('stage') stage?: MatchStage
    ) {
      if (status) {
        return this.matchesService.findByStatus(status);
      }
      if (stage) {
        return this.matchesService.findByStage(stage);
      }
      return this.matchesService.findAll();
    }
  
    @Get('upcoming')
    @ApiOperation({ summary: 'Get upcoming matches' })
    async findUpcoming() {
      return this.matchesService.findUpcoming();
    }
  
    @Get('results')
    @ApiOperation({ summary: 'Get match results' })
    async findResults() {
      return this.matchesService.findResults();
    }
  
    @Get('stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get match statistics (admin only)' })
    async getStats() {
      return this.matchesService.getMatchStats();
    }
  
    @Get('table')
    @ApiOperation({ summary: 'Get league table/standings' })
    async getLeagueTable() {
      return this.matchesService.generateLeagueTable();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get match by ID' })
    async findOne(@Param('id') id: string) {
      return this.matchesService.findOne(id);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update match (admin only)' })
    async update(@Param('id') id: string, @Body() updateMatchDto: UpdateMatchDto) {
      return this.matchesService.update(id, updateMatchDto);
    }
  
    @Patch(':id/result')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update match result (admin only)' })
    async updateResult(
      @Param('id') id: string,
      @Body() updateResultDto: UpdateMatchResultDto
    ) {
      return this.matchesService.updateResult(id, updateResultDto);
    }
  
    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update match status (admin only)' })
    async updateStatus(
      @Param('id') id: string,
      @Body('status') status: MatchStatus
    ) {
      return this.matchesService.updateStatus(id, status);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete match (admin only)' })
    async remove(@Param('id') id: string) {
      return this.matchesService.remove(id);
    }
  }
  