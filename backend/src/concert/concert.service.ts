import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConcertEntity } from '../common/entities/concert.entity';
import { ConcertReservationEntity, ReservationAction } from '../common/entities/concert-reservation.entity';
import { UserEntity } from '../common/entities/user.entity';
import { CreateConcertDto } from './dto/create-concert.dto';

@Injectable()
export class ConcertService {
  constructor(
    @InjectRepository(ConcertEntity)
    private readonly concertRepository: Repository<ConcertEntity>,
    @InjectRepository(ConcertReservationEntity)
    private readonly reservationRepository: Repository<ConcertReservationEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<ConcertEntity[]> {
    return this.concertRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ConcertEntity | null> {
    return this.concertRepository.findOne({ where: { id } });
  }

  async create(createDto: CreateConcertDto, userId: string): Promise<ConcertEntity> {
    const concert = this.concertRepository.create({
      name: createDto.name,
      totalSeats: createDto.totalSeats,
      availableSeats: createDto.totalSeats,
      description: createDto.description || '',
    });

    return this.concertRepository.save(concert);
  }

  async remove(id: string): Promise<void> {
    await this.concertRepository.delete(id);
  }

  async reserve(id: string, userId: string): Promise<ConcertReservationEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const concert = await queryRunner.manager.findOne(ConcertEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!concert) {
        throw new Error('Concert not found');
      }

      if (concert.availableSeats <= 0) {
        throw new Error('No available seats');
      }

      const existingReservation = await queryRunner.manager.findOne(ConcertReservationEntity, {
        where: { concertId: id, userId, action: ReservationAction.reserve },
      });

      if (existingReservation) {
        throw new Error('Already reserved this concert');
      }

      concert.availableSeats -= 1;
      await queryRunner.manager.save(concert);

      const reservation = queryRunner.manager.create(ConcertReservationEntity, {
        concertId: concert.id,
        userId,
        action: ReservationAction.reserve,
      });

      await queryRunner.manager.save(reservation);

      await queryRunner.commitTransaction();

      return reservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: string, userId: string): Promise<ConcertReservationEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const concert = await queryRunner.manager.findOne(ConcertEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!concert) {
        throw new Error('Concert not found');
      }

      const reservation = await queryRunner.manager.findOne(ConcertReservationEntity, {
        where: { concertId: id, userId, action: ReservationAction.reserve },
      });

      if (!reservation) {
        throw new Error('No reservation found');
      }

      concert.availableSeats += 1;
      await queryRunner.manager.save(concert);

      const cancelRecord = queryRunner.manager.create(ConcertReservationEntity, {
        concertId: concert.id,
        userId,
        action: ReservationAction.cancel,
      });

      await queryRunner.manager.save(cancelRecord);

      await queryRunner.commitTransaction();

      return cancelRecord;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getHistory(): Promise<any[]> {
    return this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.concert', 'concert')
      .select([
        'reservation.createdAt AS dateTime',
        'user.fullName AS username',
        'concert.name AS concertName',
        'reservation.action AS action',
      ])
      .orderBy('reservation.createdAt', 'DESC')
      .getRawMany();
  }
}
