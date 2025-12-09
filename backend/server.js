import path from "path";
import fs from "fs";
import express from "express";
import { fileURLToPath } from "url";

import { loadEnv } from "./config/loadEnv.js";
import passport from "./config/passport.js";
import userRoutes from "./routes/users.js";
import itemRoutes from "./routes/items.js";
import notificationRoutes from "./routes/notifications.js";
import uploadsRoute from "./routes/uploads.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(passport.initialize());

// Mount dynamic uploads route (serves images from DB) before static fallback
app.use("/uploads", uploadsRoute);
// Fallback: also serve any files from the uploads dir if present on disk
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/notifications", notificationRoutes);

const frontendBuildPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  app.use((req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/uploads") ||
      req.path === "/health"
    ) {
      return next();
    }

    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File size too large. Maximum size is 5MB." });
    }
    return res
      .status(400)
      .json({ message: err.message || "File upload error." });
  }

  res.status(500).json({ message: "Internal server error." });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
