import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import cors from "cors";
import bodyParser from "body-parser";

import userRoutes from "./routes/userRoutes";
import messagesRoutes from "./routes/contactMessageRoutes";
import insightsRoutes from "./routes/insightRoutes";
import subscriberRoutes from "./routes/subscriberRoutes";
import teamRoutes from "./routes/teamRoutes";
import publicationsRoutes from "./routes/publicationRoutes";
import officesRoutes from "./routes/officesRoutes";


const app = express();
const port = process.env.PORT || 3004;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/contact-messages", messagesRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/offices", officesRoutes);
app.use("/api/publications", publicationsRoutes);

app.get("/", (req, res) => {
  res.send("ONCG GLOBAL API is running!");
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
