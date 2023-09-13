import multipart from "parse-multipart-data";

import { prisma } from "./config/database";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") return new Response("Bun!");

    if (url.pathname === "/prompts") {
      const prompts = await prisma.prompt.findMany();

      return new Response(JSON.stringify(prompts), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("404!");
  },
});

console.log(`HTTP server running on http://localhost:${server.port}`);
