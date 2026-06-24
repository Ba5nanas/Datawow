import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConcertModule } from './concert/concert.module';
import { UserEntity } from './common/entities/user.entity';
import { ConcertEntity } from './common/entities/concert.entity';
import { ConcertReservationEntity } from './common/entities/concert-reservation.entity';
import { ConcertHistoryEntity } from './common/entities/concert-history.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'backend',
       entities: [UserEntity, ConcertEntity, ConcertReservationEntity, ConcertHistoryEntity],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    ConcertModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
