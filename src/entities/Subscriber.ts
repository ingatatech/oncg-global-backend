import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

@Entity("subscribers")
export class Subscriber {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Index({ unique: true })
  @Column()
  email!: string

  @Column({ default: true })
  isActive!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}


