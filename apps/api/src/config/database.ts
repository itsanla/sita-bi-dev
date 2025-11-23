import { PrismaClient } from '@repo/db';

/**
 * Prisma client with query logging extension
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any = new PrismaClient().$extends({
  query: {
    $allModels: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async $allOperations({ operation, model, args, query }: any) {
        const before = Date.now();
        const result = await query(args);
        const after = Date.now();

        // Log slow queries for monitoring
        if (after - before > 1000) {
          // eslint-disable-next-line no-console
          console.log(
            `⚠️  Slow query detected: ${model}.${operation} took ${after - before}ms`,
          );
        }

        return result;
      },
    },
  },
});

// eslint-disable-next-line no-console
console.log('✅ Prisma client initialized');

export default prisma;
