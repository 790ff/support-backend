import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ['Open', 'In Progress', 'Closed'],
    default: 'Open',
  })
  status: 'Open' | 'In Progress' | 'Closed';

  @Column({
    type: 'enum',
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  })
  priority: 'Low' | 'Medium' | 'High';

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  clickupId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
