import multipart from 'parse-multipart-data';

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

    if (url.pathname === "/videos" && req.method === "POST") {
      // const rawBody = Buffer.from(await req.arrayBuffer());

      // const boundary = req.headers
      //   .get("content-type")
      //   .split(";")[1]
      //   .split("=")[1];

      // const parts = multipart.parse(rawBody, boundary);

      if (!req.headers.get('content-type')?.startsWith('multipart/form-data')) {
        return new Response("Invalid content type", { status: 400 });
      }

      const boundary = multipart.getBoundary(req.headers.get('content-type')!);
      const buffer = Buffer.from(await new Response(req.body).text());
      const parts = multipart.parse(buffer, boundary);      
      const resp = {
        numFields: 0,
        numFiles: 0,
      };

      for (const p of parts) {
        console.log("Found part=", p);
        
        if (p.filename) {
          resp.numFiles++;
        } else {
          resp.numFields++;
        }
      }
      return Response.json(resp);

      // return new Response(JSON.stringify(prompts), {
      //   headers: { "content-type": "application/json" },
      // });
    }

    return new Response("404!");
  },
});

console.log(`HTTP server running on http://localhost:${server.port}`);
