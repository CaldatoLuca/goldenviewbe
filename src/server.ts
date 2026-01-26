import express, { type Request, type Response } from "express";
import { notFound } from "./middleware/notfound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import morganMiddleware from "./middleware/morgan.middleaware.js";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./utils/uploadthing.js";

import spotRoutes from "./routes/spot.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(express.json());

app.use(morganMiddleware);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
  }),
);

app.use("/auth", authRoutes);
app.use("/spots", spotRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
