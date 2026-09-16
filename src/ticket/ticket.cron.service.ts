import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { ClickUpService } from './clickup.service';

@Injectable()
export class TicketCronService {
  private readonly logger = new Logger(TicketCronService.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly clickUpService: ClickUpService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncTicketsToClickUp() {
    const tickets = await this.ticketRepository.find({
      where: { clickupId: IsNull() },
    });

    for (const ticket of tickets) {
      try {
        const clickupTask =
          await this.clickUpService.createTaskFromTicket(ticket);

        ticket.clickupId = clickupTask.id;
        await this.ticketRepository.save(ticket);

        this.logger.log(`Synced ticket ${ticket.id} to ClickUp`);
      } catch (error) {
        this.logger.error(`Failed to sync ticket ${ticket.id}`, error);
      }
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncStatusFromClickUp() {
    const tickets = await this.ticketRepository.find({
      where: { clickupId: Not(IsNull()) },
    });

    const statusMap: Record<string, Ticket['status']> = {
      'to do': 'Open',
      open: 'Open',
      'in progress': 'In Progress',
      'in-progress': 'In Progress',
      complete: 'Closed',
      completed: 'Closed',
      closed: 'Closed',
      resolved: 'Closed',
    };

    for (const ticket of tickets) {
      try {
        const clickupTask = await this.clickUpService.getTaskById(
          ticket.clickupId!,
        );

        const remoteStatus = clickupTask.status?.status?.toLowerCase();
        const mappedStatus = statusMap[remoteStatus];

        if (mappedStatus && mappedStatus !== ticket.status) {
          ticket.status = mappedStatus;
          await this.ticketRepository.save(ticket);

          this.logger.log(
            `Updated ticket ${ticket.id} status to ${mappedStatus}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to sync status for ticket ${ticket.id}`,
          error,
        );
      }
    }
  }
}
