import express, { type Request, type Response } from "express";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import morganMiddleware from "./middleware/morgan.js";

import spotRoutes from "./routes/spot.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(express.json());

app.use(morganMiddleware);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use("/auth", authRoutes);
app.use("/spots", spotRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
