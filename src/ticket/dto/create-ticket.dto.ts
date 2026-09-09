export class CreateTicketDto {
  title: string;
  description: string;
  status?: 'Open' | 'In Progress' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High';
  email?: string;
}
