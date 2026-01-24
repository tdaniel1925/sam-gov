// =============================================================================
// NOTIFICATION CRON JOB
// Checks for new opportunities and sends email notifications
// =============================================================================

import cron from 'node-cron';
import { db } from '../db';
import { notificationSubscriptions } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { SAMGovService } from './samgov-service';
import { EmailService } from './email-service';

export class NotificationJob {
  private static dailyJob: cron.ScheduledTask | null = null;
  private static weeklyJob: cron.ScheduledTask | null = null;

  /**
   * Start all notification jobs
   */
  static start(): void {
    // Daily notifications - runs every day at 8 AM
    this.dailyJob = cron.schedule('0 8 * * *', async () => {
      console.log('Running daily notifications job...');
      await this.processNotifications('daily');
    });

    // Weekly notifications - runs every Monday at 8 AM
    this.weeklyJob = cron.schedule('0 8 * * 1', async () => {
      console.log('Running weekly notifications job...');
      await this.processNotifications('weekly');
    });

    console.log('Notification jobs started');
  }

  /**
   * Stop all notification jobs
   */
  static stop(): void {
    if (this.dailyJob) {
      this.dailyJob.stop();
      this.dailyJob = null;
    }
    if (this.weeklyJob) {
      this.weeklyJob.stop();
      this.weeklyJob = null;
    }
    console.log('Notification jobs stopped');
  }

  /**
   * Process notifications for a specific frequency
   */
  private static async processNotifications(frequency: 'daily' | 'weekly'): Promise<void> {
    try {
      // Get active subscriptions for this frequency
      const subscriptions = await db
        .select()
        .from(notificationSubscriptions)
        .where(and(
          eq(notificationSubscriptions.frequency, frequency),
          eq(notificationSubscriptions.active, true)
        ));

      console.log(`Processing ${subscriptions.length} ${frequency} subscriptions`);

      for (const subscription of subscriptions) {
        try {
          await this.processSubscription(subscription);
        } catch (error) {
          console.error(`Error processing subscription ${subscription.id}:`, error);
          // Continue with next subscription
        }
      }

    } catch (error) {
      console.error('Error in notification job:', error);
    }
  }

  /**
   * Process a single subscription
   */
  private static async processSubscription(subscription: any): Promise<void> {
    // Calculate date range based on last checked date
    const now = new Date();
    const lastChecked = subscription.lastChecked || new Date(subscription.createdAt);

    // Format dates for SAM.gov API
    const formatDate = (date: Date): string => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const postedFrom = formatDate(lastChecked);
    const postedTo = formatDate(now);

    // Search for new opportunities
    const result = await SAMGovService.getOpportunitiesByNAICS(
      subscription.naicsCode,
      postedFrom,
      postedTo,
      100 // Get up to 100 new opportunities
    );

    if (result.totalRecords > 0 && result.opportunitiesData.length > 0) {
      // Send email notification
      await EmailService.sendNotification(
        subscription.email,
        subscription.naicsCode,
        result.opportunitiesData
      );

      console.log(
        `Sent notification to ${subscription.email} for ${result.opportunitiesData.length} new opportunities`
      );
    } else {
      console.log(`No new opportunities for ${subscription.email} (NAICS: ${subscription.naicsCode})`);
    }

    // Update last checked timestamp
    await db
      .update(notificationSubscriptions)
      .set({ lastChecked: now })
      .where(eq(notificationSubscriptions.id, subscription.id));
  }

  /**
   * Manually trigger notifications for testing
   */
  static async runOnce(frequency: 'daily' | 'weekly'): Promise<void> {
    console.log(`Running ${frequency} notifications manually...`);
    await this.processNotifications(frequency);
  }
}
