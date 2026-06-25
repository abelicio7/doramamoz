import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { fetchDoramas } from "@/data/doramas";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let slugs: string[] = [];
        try {
          const doramas = await fetchDoramas();
          slugs = doramas.map((d) => d.slug);
        } catch {
          slugs = [];
        }
        const entries = [
          { path: "/", priority: "1.0", changefreq: "weekly" as const },
          { path: "/pagamento", priority: "0.9", changefreq: "monthly" as const },
          { path: "/auth", priority: "0.5", changefreq: "yearly" as const },
          ...slugs.map((s) => ({
            path: `/dorama/${s}`,
            priority: "0.8",
            changefreq: "weekly" as const,
          })),
        ];
        const urls = entries
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
