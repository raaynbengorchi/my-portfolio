import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

const OPENROUTER_MODEL = 'openrouter/free';
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouterWithRetry(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  attempt = 0
) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://rayanbengourchi.vercel.app',
      'X-Title': 'Rayan Portfolio'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  const data = await response.json() as { error?: { message?: string }; choices?: Array<{ message?: { content?: string } }> };

  if (!response.ok) {
    const errorMsg = data.error?.message || '';
    const isRetryable = response.status === 429 || response.status === 500 || 
                       response.status === 502 || response.status === 503 ||
                       errorMsg.toLowerCase().includes('rate limit') ||
                       errorMsg.toLowerCase().includes('temporarily unavailable') ||
                       errorMsg.toLowerCase().includes('timeout');
    
    if (isRetryable && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(`OpenRouter attempt ${attempt + 1} failed (${response.status}: ${errorMsg}), retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return callOpenRouterWithRetry(messages, apiKey, attempt + 1);
    }
    
    throw new Error(errorMsg || `Failed to fetch from OpenRouter (${response.status})`);
  }

  return data;
}

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
              const apiKey = env.OPENROUTER_API_KEY;

              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error:
                      "Server configuration error: Missing OPENROUTER_API_KEY in .env",
                  })
                );
                return;
              }

              const data = await callOpenRouterWithRetry(messages, apiKey);

              // OpenRouter returns OpenAI-compatible format directly
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(data));
            } catch (error: unknown) {
              console.error("Local Chat API Error:", error);
              const errMsg = error instanceof Error ? error.message : String(error);
              const userMsg = errMsg.toLowerCase().includes('rate limit') || 
                              errMsg.toLowerCase().includes('temporarily unavailable') ||
                              errMsg.toLowerCase().includes('timeout') ||
                              errMsg.includes('429') || errMsg.includes('500') ||
                              errMsg.includes('502') || errMsg.includes('503')
                  ? "I'm temporarily unavailable. Please try again in a moment."
                  : 'Sorry, I could not generate a response.';
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: userMsg,
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