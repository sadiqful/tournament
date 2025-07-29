import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Team } from './team.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  teamId: string;

  @OneToOne(() => Team, team => team.payment)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  transactionReference: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}