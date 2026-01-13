import dotenv from "dotenv";

const NODE_ENV = process.env.NODE_ENV || "development";

const envFile =
  NODE_ENV === "production" ? ".env.production" : ".env.development";

dotenv.config({ path: envFile });

console.log(`Environment: ${NODE_ENV}`);

export const config = {
  nodeEnv: NODE_ENV,
  port: Number(process.env.PORT) || 3001,
  databaseUrl: process.env.DATABASE_URL,
};
