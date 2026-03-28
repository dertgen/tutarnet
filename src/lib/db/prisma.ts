import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const PRISMA_VERSION = "v3";

declare global {
  var __prisma: PrismaClient | undefined;
  var __prismaVersion: string | undefined;
}

function buildPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL tanımlanmamış");

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL formatı geçersiz");
  }

  const rawPort = url.port || "5432";
  const port = rawPort === "6543" ? 5432 : parseInt(rawPort);

  return new Pool({
    host: url.hostname,
    port,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "") || "postgres",
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

function createPrismaClient(): PrismaClient {
  const pool = buildPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getOrCreatePrisma(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return createPrismaClient();
  }
  if (globalThis.__prisma && globalThis.__prismaVersion === PRISMA_VERSION) {
    return globalThis.__prisma;
  }
  globalThis.__prismaVersion = PRISMA_VERSION;
  globalThis.__prisma = createPrismaClient();
  return globalThis.__prisma;
}

export const prisma: PrismaClient = getOrCreatePrisma();
export default prisma;
