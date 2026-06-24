import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConcertService } from './concert.service';
import { ConcertEntity } from '../common/entities/concert.entity';
import { ConcertReservationEntity, ReservationAction } from '../common/entities/concert-reservation.entity';
import { ConcertHistoryEntity, HistoryAction } from '../common/entities/concert-history.entity';
import { CreateConcertDto } from './dto/create-concert.dto';

describe('ConcertService', () => {
  let service: ConcertService;
  let concertRepository: any;
  let reservationRepository: any;
  let historyRepository: any;

  const mockConcert: ConcertEntity = {
    id: 'concert-1',
    name: 'Test Concert',
    totalSeats: 100,
    availableSeats: 100,
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
      save: jest.fn((entity: any) => Promise.resolve({ ...entity, id: 'reservation-1', createdAt: new Date() })),
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

  describe('findAll', () => {
    it('should return all concerts', async () => {
      concertRepository.find.mockResolvedValue([mockConcert]);
      reservationRepository.find.mockResolvedValue([]);
      reservationRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(concertRepository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
      expect(result).toEqual([mockConcert]);
    });

    it('should return concerts with reservedSeats count', async () => {
      concertRepository.find.mockResolvedValue([mockConcert]);
      reservationRepository.find.mockResolvedValue([]);
      reservationRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ concertId: 'concert-1', count: '50' }]),
      });

      const result = await service.findAll('user-1');

      expect(result[0].reservedSeats).toBe(50);
    });

    it('should include userReservationStatus when userId provided', async () => {
      concertRepository.find.mockResolvedValue([mockConcert]);
      reservationRepository.find.mockResolvedValue([{ concertId: 'concert-1' }]);
      reservationRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll('user-1');

      expect(result[0].userReservationStatus).toBe('reserved');
    });
  });

  describe('findOne', () => {
    it('should return a concert by id', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);

      const result = await service.findOne('concert-1');

      expect(concertRepository.findOne).toHaveBeenCalledWith({ where: { id: 'concert-1' } });
      expect(result).toEqual(mockConcert);
    });

    it('should return null when concert does not exist', async () => {
      concertRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('ADMIN can create a concert successfully', async () => {
      const createDto: CreateConcertDto = {
        name: 'New Concert',
        totalSeats: 200,
        description: 'Description',
      };

      const createdConcert = { ...mockConcert, name: 'New Concert', totalSeats: 200, availableSeats: 200 };
      concertRepository.create.mockReturnValue(createdConcert);
      concertRepository.save.mockResolvedValue(createdConcert);

      const result = await service.create(createDto, 'admin-user');

      expect(concertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Concert',
          totalSeats: 200,
          availableSeats: 200,
        }),
      );
      expect(result.totalSeats).toBe(200);
      expect(result.availableSeats).toBe(200);
    });

    it('Create concert should fail when name is missing', async () => {
      const createDto: any = {
        totalSeats: 100,
        description: 'Description',
      };

      concertRepository.create.mockReturnValue(mockConcert);
      concertRepository.save.mockResolvedValue(mockConcert);

      await service.create(createDto, 'admin-user');

      expect(concertRepository.create).toHaveBeenCalled();
    });

    it('Create concert should fail when totalSeats is less than 1', async () => {
      const createDto: any = {
        name: 'Test Concert',
        totalSeats: 0,
        description: 'Description',
      };

      concertRepository.create.mockReturnValue(mockConcert);
      concertRepository.save.mockResolvedValue(mockConcert);

      await service.create(createDto, 'admin-user');

      expect(concertRepository.create).toHaveBeenCalled();
    });

    it('Create concert should fail when totalSeats is negative', async () => {
      const createDto: any = {
        name: 'Test Concert',
        totalSeats: -1,
        description: 'Description',
      };

      concertRepository.create.mockReturnValue(mockConcert);
      concertRepository.save.mockResolvedValue(mockConcert);

      await service.create(createDto, 'admin-user');

      expect(concertRepository.create).toHaveBeenCalled();
    });

    it('Create concert should use empty string when description is missing', async () => {
      const createDto: CreateConcertDto = {
        name: 'New Concert',
        totalSeats: 100,
      };

      const createdConcert = { ...mockConcert, name: 'New Concert', totalSeats: 100, availableSeats: 100 };
      concertRepository.create.mockReturnValue(createdConcert);
      concertRepository.save.mockResolvedValue(createdConcert);

      await service.create(createDto, 'admin-user');

      expect(concertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: '' }),
      );
    });
  });

  describe('remove', () => {
    it('ADMIN can delete a concert successfully', async () => {
      concertRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('concert-1');

      expect(concertRepository.delete).toHaveBeenCalledWith('concert-1');
    });

    it('Delete concert should fail when concert does not exist', async () => {
      concertRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.remove('nonexistent')).rejects.toThrow('Concert not found');
    });
  });

  describe('reserve', () => {
    it('USER can reserve a seat successfully', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.count.mockResolvedValue(0);
      reservationRepository.findOne.mockResolvedValue(null);
      reservationRepository.create.mockReturnValue(mockReservation);
      reservationRepository.save.mockResolvedValue(mockReservation);
      historyRepository.create.mockReturnValue({ action: HistoryAction.reserve });
      historyRepository.save.mockResolvedValue({ action: HistoryAction.reserve });

      const result = await service.reserve('concert-1', 'user-1');

      expect(concertRepository.findOne).toHaveBeenCalledWith({ where: { id: 'concert-1' } });
      expect(result.action).toBe(ReservationAction.reserve);
    });

    it('Reserving creates a history record', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.count.mockResolvedValue(0);
      reservationRepository.findOne.mockResolvedValue(null);
      reservationRepository.create.mockReturnValue(mockReservation);
      reservationRepository.save.mockResolvedValue(mockReservation);
      historyRepository.create.mockReturnValue({ action: HistoryAction.reserve });
      historyRepository.save.mockResolvedValue({ action: HistoryAction.reserve });

      await service.reserve('concert-1', 'user-1');

      expect(historyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: HistoryAction.reserve }),
      );
      expect(historyRepository.save).toHaveBeenCalled();
    });

    it('USER cannot reserve the same concert twice', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.count.mockResolvedValue(0);
      reservationRepository.findOne.mockResolvedValue(mockReservation);

      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow('Already reserved this concert');
    });

    it('USER cannot reserve when concert is full', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.count.mockResolvedValue(100);

      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow('Concert is fully booked');
    });

    it('Reserving a non-existing concert should return NotFoundException', async () => {
      concertRepository.findOne.mockResolvedValue(null);

      await expect(service.reserve('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.reserve('nonexistent', 'user-1')).rejects.toThrow('Concert not found');
    });

    it('Reserving a deleted concert should fail', async () => {
      concertRepository.findOne.mockResolvedValue(null);

      await expect(service.reserve('deleted-concert', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('Race condition: count equals totalSeats should throw BadRequestException', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.count.mockResolvedValue(100);

      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow('Concert is fully booked');
      expect(reservationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('USER can cancel an existing reservation', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.findOne.mockResolvedValue(mockReservation);
      reservationRepository.delete.mockResolvedValue({ affected: 1 });
      historyRepository.create.mockReturnValue({ action: HistoryAction.cancel });
      historyRepository.save.mockResolvedValue({ action: HistoryAction.cancel });

      await service.cancel('concert-1', 'user-1');

      expect(reservationRepository.delete).toHaveBeenCalledWith(mockReservation.id);
    });

    it('Canceling creates a history record', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.findOne.mockResolvedValue(mockReservation);
      reservationRepository.delete.mockResolvedValue({ affected: 1 });
      historyRepository.create.mockReturnValue({ action: HistoryAction.cancel });
      historyRepository.save.mockResolvedValue({ action: HistoryAction.cancel });

      await service.cancel('concert-1', 'user-1');

      expect(historyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: HistoryAction.cancel }),
      );
      expect(historyRepository.save).toHaveBeenCalled();
    });

    it('USER cannot cancel when there is no active reservation', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel('concert-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.cancel('concert-1', 'user-1')).rejects.toThrow('No reservation found');
    });

    it('Canceling a non-existing concert should return NotFoundException', async () => {
      concertRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.cancel('nonexistent', 'user-1')).rejects.toThrow('Concert not found');
    });

    it('Canceling an already cancelled reservation should fail', async () => {
      concertRepository.findOne.mockResolvedValue(mockConcert);
      reservationRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel('concert-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.cancel('concert-1', 'user-1')).rejects.toThrow('No reservation found');
    });
  });

  describe('getHistory', () => {
    it('should return reservation history', async () => {
      const mockHistory = [
        { dateTime: new Date(), username: 'User 1', concertName: 'Concert A', action: 'reserve' },
      ];
      const mockBuilder: any = {};
      mockBuilder.leftJoinAndSelect = jest.fn().mockImplementation(() => mockBuilder);
      mockBuilder.select = jest.fn().mockImplementation(() => mockBuilder);
      mockBuilder.orderBy = jest.fn().mockImplementation(() => mockBuilder);
      mockBuilder.getRawMany = jest.fn().mockResolvedValue(mockHistory);
      historyRepository.createQueryBuilder.mockReturnValue(mockBuilder);

      const result = await service.getHistory();

      expect(result).toEqual(mockHistory);
    });
  });
});
