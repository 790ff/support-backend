import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { NotFoundException } from '@nestjs/common';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ClickUpService } from './clickup.service';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly clickUpService: ClickUpService,
  ) {}

  async postTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create(createTicketDto);
    const savedTicket = await this.ticketRepository.save(ticket);

    try {
      const clickUpTask =
        await this.clickUpService.createTaskFromTicket(savedTicket);

      savedTicket.clickupId = clickUpTask.id;
      await this.ticketRepository.save(savedTicket);
    } catch (error) {
      console.error('Failed to create ClickUp task:', error);
    }

    return savedTicket;
  }

  async getTicket(id: number): Promise<Ticket | null> {
    return await this.ticketRepository.findOne({ where: { id } });
  }

  async listTickets(): Promise<Ticket[]> {
    return await this.ticketRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateTicket(
    id: number,
    updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    Object.assign(ticket, updateTicketDto);
    return await this.ticketRepository.save(ticket);
  }
}
