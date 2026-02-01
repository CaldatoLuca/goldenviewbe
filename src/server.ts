import express, { type Request, type Response } from "express";
import { notFound } from "./middleware/notfound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import morganMiddleware from "./middleware/morgan.middleaware.js";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./utils/uploadthing.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import spotRoutes from "./routes/spot.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://goldenview-admin.netlify.app/",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

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
app.use("/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
