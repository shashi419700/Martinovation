import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";

import { dbConnection } from "./database/db.Connection.js";

import authRoutes from "./router/authRoutes.js";
import sosRoutes from "./router/sosRoutes.js";
import getStatistics from "./router/statisticsRoutes.js";
import aiRecommendationRoutes from "./router/aiRouteController.js";

const app = express();

config({ path: "./config.env" });

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.1.6:5000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Existing routes
app.use("/api/auth", authRoutes);
app.use("/api", sosRoutes);
app.use("/api", getStatistics);

// AI Route Recommendation
app.use("/api", aiRecommendationRoutes);

dbConnection();

export default app;
