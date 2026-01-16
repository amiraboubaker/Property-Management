import type { Express } from "express";
import fs from "fs";
import type { Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createLogger, createServer as createViteServer } from "vite";
import viteConfig from "../vite.config";


// ESM-safe __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  // Resolve the user config before creating the Vite server so aliases/root are applied
  const baseConfig = await viteConfig();
  const clientRoot = baseConfig.root ?? path.resolve(__dirname, "../client");

  const vite = await createViteServer({
    ...baseConfig,
    root: clientRoot,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: {
        server,
        path: "/vite-hmr",
      },
      allowedHosts: true,
    },
    appType: "custom",
    customLogger: {
      ...viteLogger,
      error(msg, options) {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
  });

  // Apply Vite middleware
  app.use(vite.middlewares);

  // SPA fallback
  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;

      let template = fs.readFileSync(
        path.join(clientRoot, "index.html"),
        "utf-8"
      );

      template = await vite.transformIndexHtml(url, template);

      res
        .status(200)
        .set({ "Content-Type": "text/html" })
        .end(template);
    } catch (err) {
      vite.ssrFixStacktrace(err as Error);
      next(err);
    }
  });
}
