import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConcertService } from './concert.service';
import { ConcertEntity } from '../common/entities/concert.entity';
import { ConcertReservationEntity, ReservationAction } from '../common/entities/concert-reservation.entity';
import { ConcertHistoryEntity, HistoryAction } from '../common/entities/concert-history.entity';

describe('ConcertService - Reservation Edge Cases', () => {
  let service: ConcertService;
  let concertRepository: any;
  let reservationRepository: any;
  let historyRepository: any;

  const mockConcert: ConcertEntity = {
    id: 'concert-1',
    name: 'Test Concert',
    totalSeats: 100,
    availableSeats: 1,
    description: 'A test concert',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReservation: ConcertReservationEntity = {
    id: 'reservation-1',
    concert: mockConcert,
    user: { id: 'user-1', fullName: 'Test User', email: 'test@example.com', password: 'hashed', role: 'USER' } as any,
    concertId: 'concert-1',
    userId: 'user-1',
    action: ReservationAction.reserve,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    concertRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((data: any) => ({ ...data })),
      save: jest.fn((entity: any) => Promise.resolve(entity)),
      delete: jest.fn(),
    };

    reservationRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn((data: any) => ({ ...data })),
      save: jest.fn((entity: any) => Promise.resolve(entity)),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => {
        const builder: any = {};
        builder.leftJoinAndSelect = jest.fn().mockImplementation(() => builder);
        builder.select = jest.fn().mockImplementation(() => builder);
        builder.addSelect = jest.fn().mockImplementation(() => builder);
        builder.where = jest.fn().mockImplementation(() => builder);
        builder.groupBy = jest.fn().mockImplementation(() => builder);
        builder.orderBy = jest.fn().mockImplementation(() => builder);
        builder.getRawMany = jest.fn();
        return builder;
      }),
    };

    historyRepository = {
      create: jest.fn((data: any) => ({ ...data })),
      save: jest.fn((entity: any) => Promise.resolve(entity)),
      createQueryBuilder: jest.fn(() => {
        const builder: any = {};
        builder.leftJoinAndSelect = jest.fn().mockImplementation(() => builder);
        builder.select = jest.fn().mockImplementation(() => builder);
        builder.orderBy = jest.fn().mockImplementation(() => builder);
        builder.getRawMany = jest.fn();
        return builder;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertService,
        {
          provide: 'ConcertEntityRepository',
          useValue: concertRepository,
        },
        {
          provide: 'ConcertReservationEntityRepository',
          useValue: reservationRepository,
        },
        {
          provide: 'ConcertHistoryEntityRepository',
          useValue: historyRepository,
        },
      ],
    }).compile();

    service = module.get<ConcertService>(ConcertService);
  });

  describe('Edge cases - Reservation', () => {
    it('Reserving a non-existing concert should return NotFoundException', async () => {
      concertRepository.findOne.mockResolvedValue(null);

      await expect(service.reserve('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.reserve('nonexistent', 'user-1')).rejects.toThrow('Concert not found');
    });

    it('Canceling a non-existing concert should return NotFoundException', async () => {
      concertRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.cancel('nonexistent', 'user-1')).rejects.toThrow('Concert not found');
    });

    it('Reserving a deleted concert should fail', async () => {
      concertRepository.findOne.mockResolvedValue(null);

      await expect(service.reserve('deleted-concert', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('Canceling an already cancelled reservation should fail', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel('concert-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.cancel('concert-1', 'user-1')).rejects.toThrow('No reservation found');
    });

    it('Race condition: count equals totalSeats should throw BadRequestException', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.count.mockResolvedValue(100);

      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow('Concert is fully booked');
      expect(reservationRepository.save).not.toHaveBeenCalled();
    });

    it('Ensure no reservation is created when seat limit reached', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.count.mockResolvedValue(100);

      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow(BadRequestException);

      expect(reservationRepository.create).not.toHaveBeenCalled();
      expect(reservationRepository.save).not.toHaveBeenCalled();
    });
  });
});
