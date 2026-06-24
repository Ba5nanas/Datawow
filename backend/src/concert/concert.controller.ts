import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConcertService } from './concert.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('concerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConcertController {
  constructor(private readonly concertService: ConcertService) {}

  @Get()
  async findAll() {
    return this.concertService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.concertService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateConcertDto, @Request() req: any) {
    return this.concertService.create(createDto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.concertService.remove(id);
    return {};
  }

  @Post(':id/reserve')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.CREATED)
  async reserve(@Param('id') id: string, @Request() req: any) {
    return this.concertService.reserve(id, req.user.userId);
  }

  @Post(':id/cancel')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string, @Request() req: any) {
    return this.concertService.cancel(id, req.user.userId);
  }

  @Get('history')
  @Roles(Role.ADMIN)
  async getHistory() {
    return this.concertService.getHistory();
  }
}
