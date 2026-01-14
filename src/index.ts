import app from "./server.js";
import { config } from "./config/env.js";
import Logger from "./utils/logger.js";

Logger.debug(`Env: ${config.nodeEnv}`);

app.listen(config.port, () => {
  Logger.debug(`Server is up and running @ http://localhost:${config.port}`);
});
