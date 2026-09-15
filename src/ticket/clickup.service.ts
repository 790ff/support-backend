import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class ClickUpService {
  private readonly clickupApiUrl = 'https://api.clickup.com/api/v2';
  private readonly clickupApiKey: string;
  private readonly clickupListId: string;
  private readonly clickupTeamId: string;

  constructor() {
    this.clickupApiKey = process.env.CLICKUP_API_KEY || '';
    this.clickupListId = process.env.CLICKUP_LIST_ID || '';
    this.clickupTeamId = process.env.CLICKUP_TEAM_ID || '';
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
  async getWebhooks(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.clickupApiUrl}/team/${this.clickupTeamId}/webhook`,
        {
          headers: {
            Authorization: this.clickupApiKey,
          },
        },
      );

      return response.data.webhooks || [];
    } catch (error) {
      console.error('Failed to get webhooks:', error.message);
      return [];
    }
  }

  async createWebhook(endpoint: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.clickupApiUrl}/team/${this.clickupTeamId}/webhook`,
        {
          endpoint,
          events: ['taskStatusUpdated'],
        },
        {
          headers: {
            Authorization: this.clickupApiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`Webhook created successfully: ${endpoint}`);
      return response.data;
    } catch (error) {
      console.error('Failed to create webhook:', error.message);
      throw error;
    }
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      await axios.delete(`${this.clickupApiUrl}/webhook/${webhookId}`, {
        headers: {
          Authorization: this.clickupApiKey,
        },
      });

      console.log(`Webhook deleted: ${webhookId}`);
    } catch (error) {
      console.error('Failed to delete webhook:', error.message);
      throw error;
    }
  }
}
