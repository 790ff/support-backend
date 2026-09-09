import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { Patch } from '@nestjs/common';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('')
  postTicket(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketService.postTicket(createTicketDto);
  }

  @Get(':id')
  getTicket(@Param('id') id: string): Promise<Ticket | null> {
    return this.ticketService.getTicket(Number(id));
  }

  @Get('')
  listTickets(): Promise<Ticket[]> {
    return this.ticketService.listTickets();
  }

  @Patch(':id')
  updateTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    return this.ticketService.updateTicket(Number(id), updateTicketDto);
  }
}
