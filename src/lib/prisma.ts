import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let client = globalForPrisma.prisma;

// Call only from server code when a feature needs database access.
export function getPrisma(): PrismaClient {
  if (client) return client;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for database access.");
  }

  // Managed databases such as Aiven sign their certificate with a private CA. When
  // DATABASE_CA_CERT holds that CA (PEM, "\n" escapes allowed) verify the server against it
  // instead of disabling TLS checks. sslmode is dropped from the URL so pg uses this setting.
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n").trim();
  const adapter = ca
    ? new PrismaPg({ connectionString: connectionString.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, ""), ssl: { ca } })
    : new PrismaPg({ connectionString });

  client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}
