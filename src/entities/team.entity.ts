import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Player } from './player.entity';
import { Payment } from './payment.entity';
import { Match } from './match.entity';

export enum TeamStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  coach: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  contactEmail: string;

  @Column()
  contactPhone: string;

  @Column({
    type: 'enum',
    enum: TeamStatus,
    default: TeamStatus.PENDING
  })
  status: TeamStatus;

  @Column({ default: false })
  paymentComplete: boolean;

  @OneToMany(() => Player, player => player.team)
  players: Player[];

  @OneToOne(() => Payment, payment => payment.team)
  payment: Payment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
