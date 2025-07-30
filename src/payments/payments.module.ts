import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Team } from '../entities/team.entity';
import { Payment } from '../entities/payment.entity';
import { StripeService } from './stripe.service';
import { EmailService } from '../common/services/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Team]),
    ConfigModule
],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService, EmailService],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}