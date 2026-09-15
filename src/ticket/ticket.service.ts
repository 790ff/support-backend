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

  async handleWebhook(payload: any): Promise<void> {
    try {
      const taskId = payload.task_id;
      const newStatus = payload.history_items?.[0]?.after?.status;

      if (!taskId || !newStatus) {
        console.warn('Invalid webhook payload: missing task_id or status');
        return;
      }

      const ticket = await this.ticketRepository.findOne({
        where: { clickupId: taskId },
      });

      if (!ticket) {
        console.warn(`No ticket found for ClickUp task ID: ${taskId}`);
        return;
      }

      const statusMapping: Record<string, Ticket['status']> = {
        'to do': 'Open',
        'in progress': 'In Progress',
        complete: 'Closed',
      };

      const mappedStatus =
        statusMapping[newStatus.toLowerCase()] || ticket.status;

      if (mappedStatus !== ticket.status) {
        ticket.status = mappedStatus;
        await this.ticketRepository.save(ticket);

        console.log(`Updated ticket ${ticket.id} status to ${mappedStatus}`);
      }
    } catch (error) {
      console.error('Failed to handle webhook:', error.message);
      throw error;
    }
  }
}
