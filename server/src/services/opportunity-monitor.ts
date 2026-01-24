// =============================================================================
// OPPORTUNITY MONITORING SERVICE
// Following CodeBakers patterns 06d-background-jobs.md
// Hourly polling + auto-save + "New Today" tracking
// =============================================================================

import cron from 'node-cron';
import { db } from '../db';
import { discoveredOpportunities, notificationSubscriptions } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { SAMGovService } from './samgov-service';
import { EmailService } from './email-service';

export class OpportunityMonitor {
  private static hourlyJob: cron.ScheduledTask | null = null;
  private static dailyResetJob: cron.ScheduledTask | null = null;

  /**
   * Start the monitoring jobs
   */
  static start(): void {
    // Hourly opportunity polling - runs every hour
    this.hourlyJob = cron.schedule('0 * * * *', async () => {
      console.log('Running hourly opportunity poll...');
      await this.pollOpportunities();
    });

    // Daily "isNew" flag reset - runs at midnight
    this.dailyResetJob = cron.schedule('0 0 * * *', async () => {
      console.log('Resetting "isNew" flags for new day...');
      await this.resetNewFlags();
    });

    console.log('Opportunity monitoring jobs started');
  }

  /**
   * Stop all monitoring jobs
   */
  static stop(): void {
    if (this.hourlyJob) {
      this.hourlyJob.stop();
      this.hourlyJob = null;
    }
    if (this.dailyResetJob) {
      this.dailyResetJob.stop();
      this.dailyResetJob = null;
    }
    console.log('Opportunity monitoring jobs stopped');
  }

  /**
   * Poll for new opportunities based on active subscriptions
   */
  private static async pollOpportunities(): Promise<void> {
    try {
      // Get all unique NAICS codes from active subscriptions
      const subscriptions = await db
        .select()
        .from(notificationSubscriptions)
        .where(eq(notificationSubscriptions.active, true));

      // Get unique NAICS codes
      const uniqueNaicsCodes = [...new Set(subscriptions.map(s => s.naicsCode))];

      console.log(`Polling opportunities for ${uniqueNaicsCodes.length} unique NAICS codes`);

      for (const naicsCode of uniqueNaicsCodes) {
        try {
          await this.pollNAICSCode(naicsCode);
        } catch (error) {
          console.error(`Error polling NAICS ${naicsCode}:`, error);
          // Continue with next NAICS code
        }
      }

      // Send notifications for new opportunities
      await this.sendNewOpportunityNotifications();

    } catch (error) {
      console.error('Error in opportunity polling:', error);
    }
  }

  /**
   * Poll opportunities for a specific NAICS code
   */
  private static async pollNAICSCode(naicsCode: string): Promise<void> {
    // Get opportunities from last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const formatDate = (date: Date): string => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const result = await SAMGovService.getOpportunitiesByNAICS(
      naicsCode,
      formatDate(yesterday),
      formatDate(now),
      100 // Get up to 100 opportunities
    );

    console.log(`Found ${result.totalRecords} opportunities for NAICS ${naicsCode}`);

    // Save new opportunities to database
    for (const opportunity of result.opportunitiesData) {
      try {
        await this.saveOpportunity(opportunity);
      } catch (error) {
        // Skip if duplicate (notice_id unique constraint)
        if (error instanceof Error && !error.message.includes('duplicate')) {
          console.error(`Error saving opportunity ${opportunity.noticeId}:`, error);
        }
      }
    }
  }

  /**
   * Save discovered opportunity to database
   */
  private static async saveOpportunity(opportunity: any): Promise<void> {
    await db.insert(discoveredOpportunities).values({
      noticeId: opportunity.noticeId,
      title: opportunity.title,
      solicitationNumber: opportunity.solicitationNumber,
      department: opportunity.department,
      postedDate: opportunity.postedDate,
      responseDeadline: opportunity.responseDeadLine,
      naicsCode: opportunity.naicsCode,
      opportunityData: opportunity,
      isNew: true, // Mark as new
    }).onConflictDoNothing(); // Ignore if already exists
  }

  /**
   * Send notifications for new opportunities
   */
  private static async sendNewOpportunityNotifications(): Promise<void> {
    try {
      const subscriptions = await db
        .select()
        .from(notificationSubscriptions)
        .where(eq(notificationSubscriptions.active, true));

      for (const subscription of subscriptions) {
        try {
          // Get new opportunities for this NAICS code
          const newOpps = await db
            .select()
            .from(discoveredOpportunities)
            .where(and(
              eq(discoveredOpportunities.naicsCode, subscription.naicsCode),
              eq(discoveredOpportunities.isNew, true)
            ))
            .limit(50); // Limit to 50 per notification

          if (newOpps.length > 0) {
            // Send email notification
            const opportunities = newOpps.map(opp => opp.opportunityData as any);
            await EmailService.sendNotification(
              subscription.email,
              subscription.naicsCode,
              opportunities
            );

            console.log(
              `Sent notification to ${subscription.email} for ${newOpps.length} new opportunities`
            );
          }
        } catch (error) {
          console.error(`Error sending notification to ${subscription.email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in notification sending:', error);
    }
  }

  /**
   * Reset "isNew" flags at midnight
   */
  private static async resetNewFlags(): Promise<void> {
    try {
      await db
        .update(discoveredOpportunities)
        .set({ isNew: false })
        .where(eq(discoveredOpportunities.isNew, true));

      console.log('Reset "isNew" flags for new day');
    } catch (error) {
      console.error('Error resetting new flags:', error);
    }
  }

  /**
   * Get new opportunities discovered today
   */
  static async getNewToday(naicsCode?: string): Promise<any[]> {
    try {
      if (naicsCode) {
        return await db
          .select()
          .from(discoveredOpportunities)
          .where(and(
            eq(discoveredOpportunities.isNew, true),
            eq(discoveredOpportunities.naicsCode, naicsCode)
          ))
          .limit(100);
      }

      return await db
        .select()
        .from(discoveredOpportunities)
        .where(eq(discoveredOpportunities.isNew, true))
        .limit(100);
    } catch (error) {
      console.error('Error getting new opportunities:', error);
      return [];
    }
  }

  /**
   * Manually trigger a poll for testing
   */
  static async runOnce(): Promise<void> {
    console.log('Running opportunity poll manually...');
    await this.pollOpportunities();
  }
}
