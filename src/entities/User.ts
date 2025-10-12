import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Insight } from "./Insight";
import { IsEmail } from "class-validator";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({ default: "admin" })
  role!: string;

  @OneToMany(() => Insight, (insight) => insight.author)
  insights!: Insight[];

}
