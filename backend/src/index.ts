import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

const app = express();
const port = process.env.PORT! || 9000;


app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
);


app.get('/', (_req, res) => {
  res.send('Hello World from backend test 1');
});


const server = app.listen(port, async () => {
  try {
    // await databaseConnection();

    console.log(`Server is running on ${port}`);
  } catch (error) {
    console.log(`Error while running the server ${error}`);
  }
});
