// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { registerRoutes } from "./routes"; // your routes registration
import { serveStatic } from "./static";    // static serving in prod

dotenv.config();

// Windows-friendly host and port
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = process.platform === "win32" ? undefined : "0.0.0.0";

// MongoDB connection
const mongoUrl = process.env.MONGODB_URL;
if (!mongoUrl) {
  console.error("MONGODB_URL environment variable is not set. Exiting...");
  process.exit(1);
}

mongoose.connect(mongoUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Express app
const app = express();
const httpServer = createServer(app);

// Add rawBody to IncomingMessage
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Middleware
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: false }));

// Logger helper
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Request logger middleware for APIs
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      log(logLine);
    }
  });

  next();
});

// Connect your routes
(async () => {
  await registerRoutes(httpServer, app);

  // Error handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  // Vite dev server or static serve
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Start server (Windows-friendly)
  if (process.platform === "win32") {
    httpServer.listen(PORT, () => log(`Server running at http://localhost:${PORT}`));
  } else {
    httpServer.listen({ port: PORT, host: "0.0.0.0" }, () => log(`Server running at http://localhost:${PORT}`));
  }
})();
