import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { NotFoundException } from '@nestjs/common';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async postTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create(createTicketDto);
    return await this.ticketRepository.save(ticket);
  }

  async getTicket(id: number): Promise<Ticket | null> {
    return await this.ticketRepository.findOne({ where: { id } });
  }

  async listTickets(): Promise<Ticket[]> {
    return await this.ticketRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateTicket(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    Object.assign(ticket, updateTicketDto);
    return await this.ticketRepository.save(ticket);
  }
}
