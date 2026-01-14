import express, { type Request, type Response } from "express";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import prisma from "./config/prisma.js";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use(notFound);

app.use(errorHandler);

export default app;
