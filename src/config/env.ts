import dotenv from "dotenv";
import path from "path";

const NODE_ENV = process.env.NODE_ENV || "development";

const envFile =
  NODE_ENV === "production" ? ".env.production" : ".env.development";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const config = {
  nodeEnv: NODE_ENV,
  port: Number(process.env.PORT) || 3001,
  databaseUrl: process.env.DATABASE_URL!,
  uplouploadthingToken: process.env.UPLOADTHING_TOKEN,
  jwtAccess: process.env.JWT_ACCESS_SECRET!,
  jwtRefresh: process.env.JWT_REFRESH_SECRET!,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  smtp: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.SMTP_FROM || "noreply@goldenview.app",
  },
};
