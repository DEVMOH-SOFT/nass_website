import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

function downloadMiddlewarePlugin(): Plugin {
  return {
    name: "vite-plugin-download-service",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        try {
          const rawUrl = req.url || "";
          const urlObj = new URL(rawUrl, `http://${req.headers.host || "localhost:8080"}`);
          const pathname = decodeURIComponent(urlObj.pathname);

          // Check if this is an explicit download request or calendar download
          const isDownloadRoute = pathname === "/download";
          const isCalendarPdf = pathname.toLowerCase().includes("calendar") && pathname.toLowerCase().endsWith(".pdf");
          const hasDownloadParam = urlObj.searchParams.has("download");
          const isView = urlObj.searchParams.get("view") === "true" || urlObj.searchParams.get("view") === "1";

          if ((isDownloadRoute || isCalendarPdf || hasDownloadParam) && !isView) {
            let fileParam = isDownloadRoute ? urlObj.searchParams.get("url") : pathname;
            let nameParam = isDownloadRoute ? urlObj.searchParams.get("name") : path.basename(pathname);

            if (isCalendarPdf) {
              nameParam = "NASS_LASUSTECH_2026-2027_Calendar (1).pdf";
              if (!fileParam || isDownloadRoute) {
                fileParam = fileParam || "NASS_LASUSTECH_2026-2027_Calendar (1).pdf";
              }
            }

            if (!fileParam) {
              res.statusCode = 400;
              return res.end("Missing file url");
            }

            let cleanName = (nameParam || "download.pdf").replace(/[^a-zA-Z0-9_\-\. ()]/g, "_").trim();
            let cleanRelative = fileParam.startsWith("/") ? fileParam.slice(1) : fileParam;
            cleanRelative = decodeURIComponent(cleanRelative.split("?")[0]);

            let fullPath = path.resolve(process.cwd(), cleanRelative);
            if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
              const publicPath = path.resolve(process.cwd(), "public", cleanRelative);
              if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
                fullPath = publicPath;
              }
            }

            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
              const ext = path.extname(fullPath).toLowerCase();
              if (!cleanName.includes(".")) {
                cleanName += ext || ".pdf";
              }
              const mimeTypes: Record<string, string> = {
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".webp": "image/webp",
                ".pdf": "application/pdf",
              };
              const contentType = mimeTypes[ext] || "application/octet-stream";

              res.setHeader("Content-Type", contentType);
              res.setHeader("Content-Disposition", `attachment; filename="${cleanName.replace(/"/g, '')}"`);
              const fileStream = fs.createReadStream(fullPath);
              return fileStream.pipe(res);
            }
          }
        } catch (err) {
          console.error("Download middleware error:", err);
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), downloadMiddlewarePlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
