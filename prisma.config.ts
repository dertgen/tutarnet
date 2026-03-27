import "dotenv/config";
import { defineConfig } from "prisma/config";

function buildMigrateUrl(): string | undefined {
  const direct = process.env["DIRECT_URL"];
  if (direct) return direct;

  const raw = process.env["DATABASE_URL"];
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    const hostMatch = url.hostname.match(/^aws-\d+-[^.]+\.pooler\.supabase\.com$/);
    if (!hostMatch) return raw;

    const projectRef = url.username.replace("postgres.", "");
    url.hostname = `db.${projectRef}.supabase.co`;
    url.port = "5432";
    url.username = "postgres";
    url.searchParams.delete("pgbouncer");
    url.searchParams.delete("connection_limit");
    return url.toString();
  } catch {
    return raw;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
