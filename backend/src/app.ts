import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";
import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.text({ type: "text/plain" }));

app.use("/", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
