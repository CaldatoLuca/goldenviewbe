import express, {} from "express";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();
app.get("/", (req, res) => {
    res.send("Server is running");
});
app.use(notFound);
app.use(errorHandler);
export default app;
//# sourceMappingURL=server.js.map