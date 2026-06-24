import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { ConcertEntity } from './concert.entity';

export enum HistoryAction {
  reserve = 'reserve',
  cancel = 'cancel',
}

@Entity()
export class ConcertHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ConcertEntity, { nullable: false })
  concert: ConcertEntity;

  @Column()
  concertId: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  user: UserEntity;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: HistoryAction,
  })
  action: HistoryAction;

  @CreateDateColumn()
  createdAt: Date;
}
