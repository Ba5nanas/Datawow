import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConcertService } from './concert.service';
import { ConcertEntity } from '../common/entities/concert.entity';
import { ConcertReservationEntity, ReservationAction } from '../common/entities/concert-reservation.entity';
import { CreateConcertDto } from './dto/create-concert.dto';

describe('ConcertService', () => {
  let service: ConcertService;
  let concertRepository: any;
  let reservationRepository: any;

  const mockConcert: ConcertEntity = {
    id: 'concert-1',
    name: 'Test Concert',
    totalSeats: 100,
    availableSeats: 100,
    description: 'A test concert',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReservation: Partial<ConcertReservationEntity> = {
    id: 'reservation-1',
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
        { provide: 'CONCERT_REPOSITORY', useValue: concertRepository },
        { provide: 'CONCERT_RESERVATION_REPOSITORY', useValue: reservationRepository },
      ],
    }).compile();

    service = module.get<ConcertService>(ConcertService);
  });

  describe('findAll', () => {
    it('should return all concerts', async () => {
      concertRepository.find.mockResolvedValue([mockConcert]);

      const result = await service.findAll();

      expect(concertRepository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
      expect(result).toEqual([mockConcert]);
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
      concertRepository.findOne.mockResolvedValue({ ...mockConcert, availableSeats: 5 });
      reservationRepository.findOne.mockResolvedValue(null);
      reservationRepository.create.mockReturnValue(mockReservation);
      reservationRepository.save.mockResolvedValue(mockReservation);

      const result = await service.reserve('concert-1', 'user-1');

      expect(concertRepository.findOne).toHaveBeenCalledWith({ where: { id: 'concert-1' } });
      expect(result.action).toBe(ReservationAction.reserve);
    });

    it('Reserving a seat decreases availableSeats by 1', async () => {
      concertRepository.findOne.mockResolvedValue({ ...mockConcert, availableSeats: 5 });
      reservationRepository.findOne.mockResolvedValue(null);
      reservationRepository.create.mockReturnValue(mockReservation);
      concertRepository.save.mockResolvedValue(mockConcert);
      reservationRepository.save.mockResolvedValue(mockReservation);

      await service.reserve('concert-1', 'user-1');

      expect(concertRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ availableSeats: 4 }),
      );
    });

    it('USER cannot reserve the same concert twice', async () => {
      concertRepository.findOne.mockResolvedValue({ ...mockConcert, availableSeats: 5 });
      reservationRepository.findOne.mockResolvedValue(mockReservation);

      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow('Already reserved this concert');
    });

    it('USER cannot reserve when concert is full', async () => {
      concertRepository.findOne.mockResolvedValue({ ...mockConcert, availableSeats: 0 });

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

    it('Mock race condition: availableSeats is 0 should throw BadRequestException', async () => {
      concertRepository.findOne.mockResolvedValue({ ...mockConcert, availableSeats: 0 });

      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.reserve('concert-1', 'user-1')).rejects.toThrow('Concert is fully booked');
      expect(concertRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('USER can cancel an existing reservation', async () => {
      concertRepository.findOne.mockResolvedValue({ ...mockConcert, availableSeats: 5 });
      reservationRepository.findOne.mockResolvedValue(mockReservation);
      reservationRepository.create.mockReturnValue(mockReservation);
      reservationRepository.save.mockResolvedValue(mockReservation);
      concertRepository.save.mockResolvedValue(mockConcert);

      const result = await service.cancel('concert-1', 'user-1');

      expect(result.action).toBe(ReservationAction.cancel);
    });

    it('Canceling reservation increases availableSeats by 1', async () => {
      concertRepository.findOne.mockResolvedValue({ ...mockConcert, availableSeats: 5 });
      reservationRepository.findOne.mockResolvedValue(mockReservation);
      reservationRepository.create.mockReturnValue(mockReservation);
      reservationRepository.save.mockResolvedValue(mockReservation);
      concertRepository.save.mockResolvedValue(mockConcert);

      await service.cancel('concert-1', 'user-1');

      expect(concertRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ availableSeats: 6 }),
      );
    });

    it('USER cannot cancel when there is no active reservation', async () => {
      concertRepository.findOne.mockResolvedValue({ ...mockConcert, availableSeats: 5 });
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
      concertRepository.findOne.mockResolvedValue({ ...mockConcert, availableSeats: 5 });
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
      reservationRepository.createQueryBuilder.mockReturnValue(mockBuilder);

      const result = await service.getHistory();

      expect(result).toEqual(mockHistory);
    });
  });
});
