import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { ConcertEntity } from './concert.entity';

export enum ReservationAction {
  reserve = 'reserve',
  cancel = 'cancel',
}

@Entity()
export class ConcertReservationEntity {
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
    enum: ReservationAction,
  })
  action: ReservationAction;

  @CreateDateColumn()
  createdAt: Date;
}
