import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { Team, TeamStatus } from '../entities/team.entity';
import { StripeService } from './stripe.service';
import { EmailService } from '../common/services/email.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private stripeService: StripeService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async createPaymentIntent(createPaymentDto: CreatePaymentDto) {
    const { teamId, amount, currency } = createPaymentDto;

    // Check if team exists
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['payment']
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if team already has a payment
    if (team.payment) {
      if (team.payment.status === PaymentStatus.SUCCESS) {
        throw new BadRequestException('Team has already completed payment');
      }
      
      // If payment exists but failed, create new payment intent
      if (team.payment.status === PaymentStatus.FAILED) {
        await this.paymentRepository.remove(team.payment);
      }
    }

    try {
      // Create Stripe payment intent
      const paymentIntent = await this.stripeService.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          teamId,
          teamName: team.name,
        },
      });

      // Create payment record
      const payment = this.paymentRepository.create({
        teamId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: paymentIntent.id,
        transactionReference: paymentIntent.id,
      });

      await this.paymentRepository.save(payment);

      return {
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency,
      };

    } catch (error) {
      throw new BadRequestException(`Failed to create payment intent: ${error.message}`);
    }
  }

  async handleStripeWebhook(signature: string, payload: Buffer) {
    try {
      const event = this.stripeService.constructEvent(payload, signature);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: any) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
      relations: ['team']
    });

    if (!payment) {
      console.error(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update payment status
    payment.status = PaymentStatus.SUCCESS;
    await this.paymentRepository.save(payment);

    // Update team payment status
    const team = payment.team;
    team.paymentComplete = true;
    await this.teamRepository.save(team);

    // Send confirmation email
    try {
      await this.emailService.sendPaymentConfirmation(
        team.contactEmail,
        {
          teamName: team.name,
          amount: payment.amount,
          currency: payment.currency,
          transactionId: payment.transactionReference,
        }
      );
    } catch (error) {
      console.error('Failed to send payment confirmation email:', error);
    }
  }

  private async handlePaymentFailure(paymentIntent: any) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (!payment) {
      console.error(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update payment status
    payment.status = PaymentStatus.FAILED;
    await this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['team'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByTeam(teamId: string): Promise<Payment> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId }
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const payment = await this.paymentRepository.findOne({
      where: { teamId },
      relations: ['team']
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this team');
    }

    return payment;
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['team']
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getPaymentStats() {
    const total = await this.paymentRepository.count();
    const successful = await this.paymentRepository.count({
      where: { status: PaymentStatus.SUCCESS }
    });
    const pending = await this.paymentRepository.count({
      where: { status: PaymentStatus.PENDING }
    });
    const failed = await this.paymentRepository.count({
      where: { status: PaymentStatus.FAILED }
    });

    // Calculate total revenue
    const successfulPayments = await this.paymentRepository.find({
      where: { status: PaymentStatus.SUCCESS },
      select: ['amount']
    });

    const totalRevenue = successfulPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    return {
      total,
      successful,
      pending,
      failed,
      totalRevenue,
      successRate: total > 0 ? (successful / total) * 100 : 0
    };
  }
}