import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client instance
 * Using singleton pattern to prevent multiple instances in development
 */
declare global {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

/**
 * Graceful shutdown handler
 */
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
