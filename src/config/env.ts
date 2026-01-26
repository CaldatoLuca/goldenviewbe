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
};
