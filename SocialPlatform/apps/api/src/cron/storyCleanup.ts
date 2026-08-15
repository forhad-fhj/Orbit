import cron from 'node-cron';
import { prisma } from '@socialplatform/prisma';

// Run every hour to delete expired stories
export const initStoryCleanup = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await prisma.story.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      console.log(`[Cron] Cleaned up ${result.count} expired stories.`);
    } catch (error) {
      console.error('[Cron] Error cleaning up stories:', error);
    }
  });
};
