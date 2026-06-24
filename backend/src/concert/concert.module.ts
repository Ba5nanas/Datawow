import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConcertEntity } from '../common/entities/concert.entity';
import { ConcertReservationEntity } from '../common/entities/concert-reservation.entity';
import { UserEntity } from '../common/entities/user.entity';
import { ConcertService } from './concert.service';
import { ConcertController } from './concert.controller';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConcertEntity, ConcertReservationEntity, UserEntity]),
  ],
  controllers: [ConcertController],
  providers: [ConcertService, JwtStrategy, RolesGuard],
  exports: [ConcertService],
})
export class ConcertModule {}
