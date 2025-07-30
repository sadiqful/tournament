import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Headers,
    RawBody,
    HttpCode,
    HttpStatus
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { PaymentsService } from './payments.service';
  import { CreatePaymentDto } from './dto/create-payment.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  @ApiTags('Payments')
  @Controller('payments')
  export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}
  
    @Post('create-intent')
    @ApiOperation({ summary: 'Create payment intent for team registration' })
    async createPaymentIntent(@Body() createPaymentDto: CreatePaymentDto) {
      return this.paymentsService.createPaymentIntent(createPaymentDto);
    }
  
    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Stripe webhook endpoint' })
    async handleWebhook(
      @Headers('stripe-signature') signature: string,
      @RawBody() payload: Buffer
    ) {
      return this.paymentsService.handleStripeWebhook(signature, payload);
    }
  
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all payments (admin only)' })
    async findAll() {
      return this.paymentsService.findAll();
    }
  
    @Get('stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get payment statistics (admin only)' })
    async getStats() {
      return this.paymentsService.getPaymentStats();
    }
  
    @Get('team/:teamId')
    @ApiOperation({ summary: 'Get payment by team ID' })
    async findByTeam(@Param('teamId') teamId: string) {
      return this.paymentsService.findByTeam(teamId);
    }
  
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get payment by ID (admin only)' })
    async findOne(@Param('id') id: string) {
      return this.paymentsService.findOne(id);
    }
  }
