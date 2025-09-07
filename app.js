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
app.use("/auth/api/v1", authRoute);
app.use("/group/api/v1", groupRoute);

// ✅ Serve React frontend
const frontendPath = path.join(__dirname, "../dist"); // safer: go up 1 level
app.use(
  express.static(frontendPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// ✅ Catch-all route must come *after* static + API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Error handler
app.use((error, req, res, next) => {
  console.log("Error ==> ", error.message);

  if (error.ErrorTypes === Internal) {
    return res.status(error.statusCode || 400).json({
      redirect: false,
      success: false,
      message: error.message,
    });
  } else {
    return res.status(error.statusCode || 500).json({
      redirect: true,
      success: false,
      message: error.message,
    });
  }
});

const port = Number(process.env.PORT) || 8000;

app.listen(port, () => {
  console.log(`App started at http://localhost:${port}`);
});

export default app;
