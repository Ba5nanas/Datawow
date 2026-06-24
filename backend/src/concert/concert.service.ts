import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConcertEntity } from '../common/entities/concert.entity';
import { ConcertReservationEntity, ReservationAction } from '../common/entities/concert-reservation.entity';
import { CreateConcertDto } from './dto/create-concert.dto';

@Injectable()
export class ConcertService {
  constructor(
    @InjectRepository(ConcertEntity)
    private readonly concertRepository: Repository<ConcertEntity>,
    @InjectRepository(ConcertReservationEntity)
    private readonly reservationRepository: Repository<ConcertReservationEntity>,
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
    const result = await this.concertRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Concert not found');
    }
  }

  async reserve(id: string, userId: string): Promise<ConcertReservationEntity> {
    const concert = await this.concertRepository.findOne({ where: { id } });

    if (!concert) {
      throw new NotFoundException('Concert not found');
    }

    if (concert.availableSeats <= 0) {
      throw new BadRequestException('Concert is fully booked');
    }

    const existingReservation = await this.reservationRepository.findOne({
      where: { concertId: id, userId, action: ReservationAction.reserve },
    });

    if (existingReservation) {
      throw new BadRequestException('Already reserved this concert');
    }

    concert.availableSeats -= 1;
    await this.concertRepository.save(concert);

    const reservation = this.reservationRepository.create({
      concertId: concert.id,
      userId,
      action: ReservationAction.reserve,
    });

    return this.reservationRepository.save(reservation);
  }

  async cancel(id: string, userId: string): Promise<ConcertReservationEntity> {
    const concert = await this.concertRepository.findOne({ where: { id } });

    if (!concert) {
      throw new NotFoundException('Concert not found');
    }

    const reservation = await this.reservationRepository.findOne({
      where: { concertId: id, userId, action: ReservationAction.reserve },
    });

    if (!reservation) {
      throw new BadRequestException('No reservation found');
    }

    concert.availableSeats += 1;
    await this.concertRepository.save(concert);

    const cancelRecord = this.reservationRepository.create({
      concertId: concert.id,
      userId,
      action: ReservationAction.cancel,
    });

    return this.reservationRepository.save(cancelRecord);
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
