import { prisma } from "./config/database";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/")
      return new Response("Bun!");

    if (req.method === "GET" && url.pathname === "/prompts") {
      const prompts = await prisma.prompt.findMany();

      return new Response(JSON.stringify(prompts), {
        headers: { "content-type": "application/json" },
      });
    }

    if (req.method === "POST" && url.pathname === "/videos") {
      const formdata = await req.formData();
      const file = formdata.get("file");

      if (!file) throw new Error("No file provided");

      const name = Math.random().toString(36).substring(2, 10).toUpperCase();
      const path = `tmp/${name}.mp3`;

      await Bun.write(path, file);

      const video = await prisma.video.create({ data: { name, path } });

      return new Response(JSON.stringify(video), {
        headers: { "content-type": "application/json" },
      });
    }

    if (
      req.method === "POST" &&
      url.pathname.startsWith("/videos/") &&
      url.pathname.endsWith("/transcription")
    ) {
      const videoId = url.pathname.split("/").at(-2);
      const body = await req.json();

      const { prompt } = body;

      const video = await prisma.video.findUniqueOrThrow({
        where: { id: videoId },
      });

      return new Response(JSON.stringify({ video, prompt }), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("404!");
  },
});

console.log(`HTTP server running on http://localhost:${server.port}`);
