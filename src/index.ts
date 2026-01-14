import app from "./server.js";
import { config } from "./config/env.js";
import Logger from "./utils/logger.js";

Logger.info(`Env: ${config.nodeEnv}`);

Logger.info(`----------------------`);

app.listen(config.port, () => {
  Logger.info(`Server is up and running @ http://localhost:${config.port}`);
});
