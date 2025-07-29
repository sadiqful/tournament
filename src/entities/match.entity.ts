import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Team } from './team.entity';

export enum MatchStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MatchStage {
  GROUP_STAGE = 'group_stage',
  ROUND_16 = 'round_16',
  QUARTER_FINAL = 'quarter_final',
  SEMI_FINAL = 'semi_final',
  FINAL = 'final'
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  teamAId: string;

  @Column()
  teamBId: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'teamAId' })
  teamA: Team;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'teamBId' })
  teamB: Team;

  @Column()
  matchDate: Date;

  @Column()
  venue: string;

  @Column({ nullable: true })
  scoreA: number;

  @Column({ nullable: true })
  scoreB: number;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED
  })
  status: MatchStatus;

  @Column({
    type: 'enum',
    enum: MatchStage
  })
  stage: MatchStage;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}