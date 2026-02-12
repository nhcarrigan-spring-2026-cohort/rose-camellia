import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: ["query", "error", "warn"], // for debugging
});

const app = express();
const port = process.env.PORT || 9000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

app.get("/", (_req, res) => {
  res.send("Hello World from backend test 1");
});

// Health check route to test DB connection
app.get("/health", async (_req, res) => {
  try {
    await prisma.$connect();
    //retrieves all entires in user table
    let users = await prisma.user.findMany()
    console.log(users)
    
    //removes previously created test user
    await prisma.user.delete({where:{
      username: "willis"
    }})

    //creates new user
    await prisma.user.create({data:{name:"Adam",email:"willis@test.com", hashedPassword:"abcde", username:"willis", }})
    
    //retrieves and logs updated user table
    users = await prisma.user.findMany()
    console.log(users)

    //updates a user
    await prisma.user.update({
      where:{
        username:"willis"
      },
      data:{
        email:"willis@test2.com"
      }

    })

    //update users to return
    users = await prisma.user.findMany()

    res.json({ status: "ok", database: "connected" , data:users});
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});




// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export prisma for use in other files
export { prisma };
