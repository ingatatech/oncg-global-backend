import "dotenv/config";
import { DataSource } from "typeorm";
import { Insight } from "./entities/Insight";
import { User } from "./entities/User";
import { ContactMessage } from "./entities/ContactMessage";
import { Subscriber } from "./entities/Subscriber";
import { TeamMember } from "./entities/Team";
import { Publication } from "./entities/Publication";
import { Office } from "./entities/Offices";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.POSTGRES_URL,
  synchronize: true, // Set to false in production
  logging: true,

  entities: [
    Insight,
    User,
    TeamMember,
    Publication,
    Office,
    ContactMessage,
    Insight,
    Subscriber,
  ],
  migrations: [__dirname + "/migrations/*.ts"],
  ssl: { rejectUnauthorized: false },
});
