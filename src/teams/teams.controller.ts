import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Query
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { TeamsService } from './teams.service';
  import { CreateTeamDto } from './dto/create-team.dto';
  import { UpdateTeamDto } from './dto/update-team.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { TeamStatus } from '../entities/team.entity';
  
  @ApiTags('Teams')
  @Controller('teams')
  export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}
  
    @Post()
    @ApiOperation({ summary: 'Register a new team' })
    @UseInterceptors(FileInterceptor('logo'))
    async create(
      @Body() createTeamDto: CreateTeamDto,
      @UploadedFile() logo?: Express.Multer.File
    ) {
      if (logo) {
        createTeamDto.logo = logo.filename;
      }
      return this.teamsService.create(createTeamDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all approved teams' })
    async findAll() {
      return this.teamsService.findAll();
    }
  
    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all teams (admin only)' })
    async findAllForAdmin() {
      return this.teamsService.findAllForAdmin();
    }
  
    @Get('stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get team statistics (admin only)' })
    async getStats() {
      return this.teamsService.getTeamStats();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get team by ID' })
    async findOne(@Param('id') id: string) {
      return this.teamsService.findOne(id);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update team (admin only)' })
    async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
      return this.teamsService.update(id, updateTeamDto);
    }
  
    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update team status (admin only)' })
    async updateStatus(
      @Param('id') id: string,
      @Body('status') status: TeamStatus
    ) {
      return this.teamsService.updateStatus(id, status);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete team (admin only)' })
    async remove(@Param('id') id: string) {
      return this.teamsService.remove(id);
    }
  }
  