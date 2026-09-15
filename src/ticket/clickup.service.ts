import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class ClickUpService {
  private readonly clickupApiUrl = 'https://api.clickup.com/api/v2';
  private readonly clickupApiKey: string;
  private readonly clickupListId: string;

  constructor() {
    this.clickupApiKey = process.env.CLICKUP_API_KEY || '';
    this.clickupListId = process.env.CLICKUP_LIST_ID || '';
  }

  async createTaskFromTicket(ticket: Ticket): Promise<any> {
    const statusMap = {
      Open: 'to do',
      'In Progress': 'in progress',
      Closed: 'complete',
    };

    const priorityMap = {
      Low: 4,
      Medium: 3,
      High: 2,
    };

    const response = await axios.post(
      `${this.clickupApiUrl}/list/${this.clickupListId}/task`,
      {
        name: ticket.title,
        description: `${ticket.description}\n\nFrom: ${ticket.email ?? 'Not provided'}`,
        status: statusMap[ticket.status],
        priority: priorityMap[ticket.priority],
      },
      {
        headers: {
          Authorization: this.clickupApiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }
}
