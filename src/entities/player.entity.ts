import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Team } from './team.entity';

export enum PlayerPosition {
  GOALKEEPER = 'goalkeeper',
  DEFENDER = 'defender',
  MIDFIELDER = 'midfielder',
  FORWARD = 'forward'
}

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column({
    type: 'enum',
    enum: PlayerPosition
  })
  position: PlayerPosition;

  @Column({ unique: true })
  jerseyNumber: number;

  @Column({ nullable: true })
  photo: string;

  @Column()
  teamId: string;

  @ManyToOne(() => Team, team => team.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}