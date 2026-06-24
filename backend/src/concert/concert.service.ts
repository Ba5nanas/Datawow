import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConcertEntity } from '../common/entities/concert.entity';
import { ConcertReservationEntity, ReservationAction } from '../common/entities/concert-reservation.entity';
import { ConcertHistoryEntity, HistoryAction } from '../common/entities/concert-history.entity';
import { CreateConcertDto } from './dto/create-concert.dto';

@Injectable()
export class ConcertService {
  constructor(
    @InjectRepository(ConcertEntity)
    private readonly concertRepository: Repository<ConcertEntity>,
    @InjectRepository(ConcertReservationEntity)
    private readonly reservationRepository: Repository<ConcertReservationEntity>,
    @InjectRepository(ConcertHistoryEntity)
    private readonly historyRepository: Repository<ConcertHistoryEntity>,
  ) {}

  async findAll(userId?: string): Promise<any[]> {
    const concerts = await this.concertRepository.find({ order: { createdAt: 'DESC' } });
    
    if (!userId) return concerts;
    
    const reservations = await this.reservationRepository.find({
      where: { userId, action: ReservationAction.reserve },
    });
    
    const reservedConcertIds = reservations.map(r => r.concertId);
    
    const reservedCounts = await this.reservationRepository
      .createQueryBuilder('r')
      .select('r.concertId', 'concertId')
      .addSelect('COUNT(*)', 'count')
      .where('r.action = :action', { action: ReservationAction.reserve })
      .groupBy('r.concertId')
      .getRawMany();
    
    const reservedMap: Record<string, number> = {};
    reservedCounts.forEach(r => {
      reservedMap[r.concertId] = parseInt(r.count);
    });
    
    return concerts.map(concert => ({
      ...concert,
      reservedSeats: reservedMap[concert.id] || 0,
      userReservationStatus: reservedConcertIds.includes(concert.id) ? 'reserved' : null,
    }));
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

    const reservedCount = await this.reservationRepository.count({
      where: { concertId: id, action: ReservationAction.reserve },
    });

    if (reservedCount >= concert.totalSeats) {
      throw new BadRequestException('Concert is fully booked');
    }

    const existingReservation = await this.reservationRepository.findOne({
      where: { concertId: id, userId, action: ReservationAction.reserve },
    });

    if (existingReservation) {
      throw new BadRequestException('Already reserved this concert');
    }

    const reservation = this.reservationRepository.create({
      concertId: concert.id,
      userId,
      action: ReservationAction.reserve,
    });

    await this.reservationRepository.save(reservation);

    const history = this.historyRepository.create({
      concertId: concert.id,
      userId,
      action: HistoryAction.reserve,
    });

    await this.historyRepository.save(history);

    return reservation;
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

    await this.reservationRepository.delete(reservation.id);

    const history = this.historyRepository.create({
      concertId: concert.id,
      userId,
      action: HistoryAction.cancel,
    });

    await this.historyRepository.save(history);

    return reservation;
  }

  async getHistory(): Promise<any[]> {
    const raw = await this.historyRepository
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.user', 'user')
      .leftJoinAndSelect('h.concert', 'concert')
      .select([
        'h.createdAt AS "dateTime"',
        'user.fullName AS "username"',
        'concert.name AS "concertName"',
        'h.action AS "action"',
      ])
      .orderBy('h.createdAt', 'DESC')
      .getRawMany();

    return raw.map(row => ({
      dateTime: row.dateTime,
      username: row.username,
      concertName: row.concertName,
      action: row.action,
    }));
  }
}
