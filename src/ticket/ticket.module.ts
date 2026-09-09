import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
@Module({
  controllers: [TicketController],
  imports: [TypeOrmModule.forFeature([Ticket])],
  providers: [TicketService],
})
export class TicketModule {}
