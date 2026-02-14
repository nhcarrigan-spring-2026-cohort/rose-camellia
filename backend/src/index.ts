import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import routes from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

const app = express();
const port = process.env.PORT || 9000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

// Routes
app.get("/", (_req, res) => {
  res.send("Rose Camellia API - Lost Pet Reunion Board");
});

app.get("/health", async (_req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// API Routes
app.use("/api", routes);

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { prisma };
