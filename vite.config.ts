import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

// Local handler for POST /api/chat during `vite dev`.
// Mirrors the Vercel serverless function in api/chat.js so the AI
// chatbot works in development without deploying.
function localChatApi(): Plugin {
  return {
    name: "local-chat-api",
    configureServer(server) {
      const env = loadEnv(
        server.config.mode,
        server.config.envDir ?? process.cwd(),
        ""
      );

      server.middlewares.use(
        "/api/chat",
        async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          let body = "";
          req.on("data", (chunk: Buffer) => {
            body += chunk;
          });

          req.on("end", async () => {
            try {
              const { messages } = JSON.parse(body || "{}");
              const apiKey = env.GROQ_API_KEY;

              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error:
                      "Server configuration error: Missing GROQ_API_KEY in .env",
                  })
                );
                return;
              }

              const groqRes = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    messages,
                    model: "llama-3.3-70b-versatile",
                  }),
                }
              );

              const data = (await groqRes.json()) as {
                error?: { message?: string };
                choices?: { message?: { content?: string } }[];
              };

              if (!groqRes.ok) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: data.error?.message || "Failed to fetch from Groq",
                  })
                );
                return;
              }

              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(data));
            } catch (error) {
              console.error("Local Chat API Error:", error);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: "Internal Server Error",
                  details: String(error),
                })
              );
            }
          });
        }
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localChatApi()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three', 'three-stdlib'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          'gsap': ['gsap'],
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['three', 'gsap', 'lenis']
  },
  server: {
    watch: {
      ignored: ['**/profil/**'],
    },
  },
});
