import express, { type Request, type Response } from "express";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import prisma from "./config/prisma.js";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

//controlla che avda la connessione
app.get("/test-db", async (req: Request, res: Response) => {
  try {
    const spot = await prisma.spot.findFirst();
    if (!spot) return res.json({ message: "Nessun record trovato" });
    res.json(spot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore connessione DB" });
  }
});

app.use(notFound);
app.use(errorHandler);

export default app;
