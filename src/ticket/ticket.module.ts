import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { Ticket } from './entities/ticket.entity';
import { TicketCronService } from './ticket.cron.service';
import { ClickUpService } from './clickup.service';

@Module({
  controllers: [TicketController],
  imports: [TypeOrmModule.forFeature([Ticket])],
  providers: [TicketService, ClickUpService, TicketCronService],
})
export class TicketModule implements OnModuleInit {
  private readonly logger = new Logger(TicketModule.name);

  constructor(private readonly clickUpService: ClickUpService) {}

  async onModuleInit() {
    await this.setupWebhook();
  }

  private async setupWebhook() {
    try {
      const webhookUrl = process.env.WEBHOOK_URL || '';

      if (!webhookUrl) {
        this.logger.warn('No webhook URL configured');
        return;
      }

      const fullWebhookUrl = `${webhookUrl}/ticket/webhook`;
      const webhooks = await this.clickUpService.getWebhooks();

      const existingWebhook = webhooks.find(
        (webhook) => webhook.endpoint === fullWebhookUrl,
      );

      if (!existingWebhook) {
        await this.clickUpService.createWebhook(fullWebhookUrl);
      }

      const oldWebhooks = webhooks.filter(
        (webhook) =>
          webhook.endpoint.includes('ngrok') &&
          webhook.endpoint !== fullWebhookUrl,
      );

      for (const oldWebhook of oldWebhooks) {
        await this.clickUpService.deleteWebhook(oldWebhook.id);
      }
    } catch (error) {
      this.logger.error('Failed to setup webhook:', error.message);
    }
  }
}
