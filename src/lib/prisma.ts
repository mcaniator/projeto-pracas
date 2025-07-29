import { PrismaClient } from "@prisma/client";

// Evita múltiplas instâncias no ambiente de desenvolvimento (hot reload)
const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
