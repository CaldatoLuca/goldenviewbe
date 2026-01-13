import app from "./server.js";
import { config } from "./config/env.js";

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
