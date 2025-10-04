import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dbConnection from "./connection/mongodb.connection.js";
import authRoute from "./routes/authentication.routes.js";
import { Internal } from "./utils/ErrorTypesCode.js";
import cookieParser from "cookie-parser";
import groupRoute from "./routes/group.routes.js";

const app = express();

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// DB connection
dbConnection();

// API routes

// ✅ Serve React frontend
const frontendPath = path.join(__dirname, "./newdist"); // safer: go up 1 level
app.use(express.static(frontendPath));

app.use("/auth/api/v1", authRoute);
app.use("/group/api/v1", groupRoute);

// ✅ Catch-all route must come *after* static + API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Error ==> ", error);

  const status = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(status).json({
    redirect: error.ErrorTypes === Internal ? false : true,
    success: false,
    message,
  });
});

const port = Number(process.env.PORT) || 8000;

app.listen(port, () => {
  console.log(`App started at http://localhost:${port}`);
});

export default app;
