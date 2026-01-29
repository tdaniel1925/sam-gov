// =============================================================================
// EMAIL SERVICE
// Enhanced with daily digest, weekly summary, and saved search alerts
// =============================================================================

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { Opportunity } from '../types/samgov';

interface OpportunityEmailData {
  title: string;
  noticeId: string;
  agency: string;
  dueDate: string;
  link: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;
  private static isConfigured: boolean = false;

  /**
   * Get or create email transporter (lazy initialization)
   */
  private static getTransporter(): Transporter | null {
    if (!this.transporter && !this.isConfigured) {
      const emailHost = process.env.EMAIL_HOST;
      const emailUser = process.env.EMAIL_USER;
      const emailPassword = process.env.EMAIL_PASSWORD;

      if (!emailHost || !emailUser || !emailPassword) {
        console.log('⚠️  Email service not configured - emails will be logged instead of sent');
        console.log('   Add EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD to .env.local to enable');
        this.isConfigured = true;
        return null;
      }

      try {
        this.transporter = nodemailer.createTransport({
          host: emailHost,
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: parseInt(process.env.EMAIL_PORT || '587') === 465,
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });
        this.isConfigured = true;
        console.log('✅ Email service configured successfully');
      } catch (error) {
        console.error('❌ Failed to initialize email service:', error);
        this.isConfigured = true;
        return null;
      }
    }
    return this.transporter;
  }
  /**
   * Send notification email with new opportunities
   */
  static async sendNotification(
    email: string,
    naicsCode: string,
    opportunities: Opportunity[]
  ): Promise<void> {
    try {
      const html = this.generateEmailHTML(naicsCode, opportunities);
      const text = this.generateEmailText(naicsCode, opportunities);

      const transporter = this.getTransporter();

      if (!transporter) {
        console.log('📧 [EMAIL PREVIEW] Would send notification:');
        console.log(`   To: ${email}`);
        console.log(`   Subject: New Contracting Opportunities for NAICS ${naicsCode}`);
        console.log(`   Opportunities: ${opportunities.length}`);
        return;
      }

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `New Contracting Opportunities for NAICS ${naicsCode}`,
        text,
        html,
      });

      console.log(`✅ Notification sent to ${email} for NAICS ${naicsCode}`);
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw error;
    }
  }

  /**
   * Send daily digest email
   */
  static async sendDailyDigest(
    email: string,
    opportunities: OpportunityEmailData[]
  ): Promise<boolean> {
    try {
      const html = this.generateDailyDigestHTML(opportunities);
      const text = this.generateDailyDigestText(opportunities);

      const transporter = this.getTransporter();

      if (!transporter) {
        console.log('📧 [EMAIL PREVIEW] Would send daily digest:');
        console.log(`   To: ${email}`);
        console.log(`   Opportunities: ${opportunities.length}`);
        return true;
      }

      await transporter.sendMail({
        from: `"SAM.gov Opportunities" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Daily Digest: ${opportunities.length} New Opportunities`,
        html,
        text,
      });

      console.log(`✅ Daily digest sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send daily digest:', error);
      return false;
    }
  }

  /**
   * Send weekly summary email
   */
  static async sendWeeklySummary(
    email: string,
    opportunities: OpportunityEmailData[],
    stats: {
      totalOpportunities: number;
      totalValue: string;
      topAgencies: string[];
    }
  ): Promise<boolean> {
    try {
      const html = this.generateWeeklySummaryHTML(opportunities, stats);
      const text = this.generateWeeklySummaryText(opportunities, stats);

      const transporter = this.getTransporter();

      if (!transporter) {
        console.log('📧 [EMAIL PREVIEW] Would send weekly summary:');
        console.log(`   To: ${email}`);
        console.log(`   Total Opportunities: ${stats.totalOpportunities}`);
        return true;
      }

      await transporter.sendMail({
        from: `"SAM.gov Opportunities" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Weekly Summary: ${stats.totalOpportunities} Opportunities`,
        html,
        text,
      });

      console.log(`✅ Weekly summary sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send weekly summary:', error);
      return false;
    }
  }

  /**
   * Send saved search alert email
   */
  static async sendSavedSearchAlert(
    email: string,
    searchName: string,
    opportunities: OpportunityEmailData[]
  ): Promise<boolean> {
    try {
      const html = this.generateSavedSearchAlertHTML(searchName, opportunities);
      const text = this.generateSavedSearchAlertText(searchName, opportunities);

      const transporter = this.getTransporter();

      if (!transporter) {
        console.log('📧 [EMAIL PREVIEW] Would send saved search alert:');
        console.log(`   To: ${email}`);
        console.log(`   Search: ${searchName}`);
        console.log(`   Matches: ${opportunities.length}`);
        return true;
      }

      await transporter.sendMail({
        from: `"SAM.gov Opportunities" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Alert: ${opportunities.length} matches for "${searchName}"`,
        html,
        text,
      });

      console.log(`✅ Saved search alert sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send saved search alert:', error);
      return false;
    }
  }

  /**
   * Generate HTML email content
   */
  private static generateEmailHTML(naicsCode: string, opportunities: Opportunity[]): string {
    const opportunitiesHTML = opportunities
      .map(
        (opp) => `
        <div style="border: 1px solid #e0e0e0; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #1a73e8;">${opp.title}</h3>
          <p><strong>Notice ID:</strong> ${opp.noticeId}</p>
          ${opp.solicitationNumber ? `<p><strong>Solicitation Number:</strong> ${opp.solicitationNumber}</p>` : ''}
          ${opp.department ? `<p><strong>Department:</strong> ${opp.department}</p>` : ''}
          ${opp.postedDate ? `<p><strong>Posted:</strong> ${opp.postedDate}</p>` : ''}
          ${opp.responseDeadLine ? `<p><strong>Deadline:</strong> ${opp.responseDeadLine}</p>` : ''}
          ${opp.description ? `<p>${opp.description.substring(0, 200)}...</p>` : ''}
          ${opp.uiLink ? `<p><a href="${opp.uiLink}" style="color: #1a73e8; text-decoration: none;">View on SAM.gov →</a></p>` : ''}
        </div>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Opportunities</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1a73e8; color: white; padding: 20px; border-radius: 5px; text-align: center;">
            <h1 style="margin: 0;">SAM.gov Opportunities</h1>
          </div>

          <div style="padding: 20px 0;">
            <p>You have <strong>${opportunities.length} new contracting ${opportunities.length === 1 ? 'opportunity' : 'opportunities'}</strong> for NAICS code <strong>${naicsCode}</strong>:</p>

            ${opportunitiesHTML}
          </div>

          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>You're receiving this email because you subscribed to notifications for NAICS code ${naicsCode}.</p>
            <p>To unsubscribe, please visit your account settings.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate plain text email content
   */
  private static generateEmailText(naicsCode: string, opportunities: Opportunity[]): string {
    const opportunitiesText = opportunities
      .map((opp, index) => {
        let text = `\n${index + 1}. ${opp.title}\n`;
        text += `   Notice ID: ${opp.noticeId}\n`;
        if (opp.solicitationNumber) text += `   Solicitation: ${opp.solicitationNumber}\n`;
        if (opp.department) text += `   Department: ${opp.department}\n`;
        if (opp.postedDate) text += `   Posted: ${opp.postedDate}\n`;
        if (opp.responseDeadLine) text += `   Deadline: ${opp.responseDeadLine}\n`;
        if (opp.uiLink) text += `   Link: ${opp.uiLink}\n`;
        return text;
      })
      .join('\n');

    return `
SAM.gov Contracting Opportunities

You have ${opportunities.length} new contracting ${opportunities.length === 1 ? 'opportunity' : 'opportunities'} for NAICS code ${naicsCode}:

${opportunitiesText}

---
You're receiving this email because you subscribed to notifications for NAICS code ${naicsCode}.
To unsubscribe, please visit your account settings.
    `.trim();
  }

  /**
   * Generate HTML for daily digest
   */
  private static generateDailyDigestHTML(opportunities: OpportunityEmailData[]): string {
    const opportunityRows = opportunities.map(opp => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #111827;">
            <a href="${opp.link}" style="color: #2563eb; text-decoration: none;">${opp.title}</a>
          </h3>
          <p style="margin: 4px 0; font-size: 14px; color: #6b7280;">
            <strong>${opp.agency}</strong> • Due: ${new Date(opp.dueDate).toLocaleDateString()}
          </p>
          <p style="margin: 4px 0; font-size: 13px; color: #9ca3af;">Notice ID: ${opp.noticeId}</p>
        </td>
      </tr>
    `).join('');

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    return `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #2563eb; padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Daily Opportunity Digest</h1>
            <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">
              ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style="padding: 24px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
              We found <strong>${opportunities.length} new opportunities</strong> matching your preferences today.
            </p>
            <table style="width: 100%; border-collapse: collapse;">${opportunityRows}</table>
            <div style="margin-top: 24px; padding: 16px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
              <a href="${clientUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">View All Opportunities</a>
            </div>
          </div>
          <div style="padding: 16px 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">You're receiving this because you enabled daily digest emails.
              <a href="${clientUrl}/notifications" style="color: #2563eb;">Manage preferences</a>
            </p>
          </div>
        </div>
      </body></html>
    `;
  }

  private static generateDailyDigestText(opportunities: OpportunityEmailData[]): string {
    let text = `DAILY OPPORTUNITY DIGEST\n`;
    text += `${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
    text += `We found ${opportunities.length} new opportunities matching your preferences today.\n\n`;

    opportunities.forEach((opp, idx) => {
      text += `${idx + 1}. ${opp.title}\n`;
      text += `   Agency: ${opp.agency}\n`;
      text += `   Due: ${new Date(opp.dueDate).toLocaleDateString()}\n`;
      text += `   Notice ID: ${opp.noticeId}\n`;
      text += `   Link: ${opp.link}\n\n`;
    });

    text += `View all: ${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard\n`;
    return text;
  }

  private static generateWeeklySummaryHTML(
    opportunities: OpportunityEmailData[],
    stats: { totalOpportunities: number; totalValue: string; topAgencies: string[] }
  ): string {
    const topOpps = opportunities.slice(0, 10);
    const opportunityRows = topOpps.map(opp => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #111827;">
            <a href="${opp.link}" style="color: #2563eb; text-decoration: none;">${opp.title}</a>
          </h3>
          <p style="margin: 4px 0; font-size: 14px; color: #6b7280;">
            <strong>${opp.agency}</strong> • Due: ${new Date(opp.dueDate).toLocaleDateString()}
          </p>
        </td>
      </tr>
    `).join('');

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    return `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #7c3aed; padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Weekly Opportunity Summary</h1>
            <p style="margin: 8px 0 0 0; color: #ede9fe; font-size: 14px;">Week of ${new Date().toLocaleDateString()}</p>
          </div>
          <div style="padding: 24px;">
            <div style="margin-bottom: 24px; padding: 16px; background-color: #f0f9ff; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #0369a1; font-weight: 500;">Total Opportunities</p>
              <p style="margin: 4px 0 0 0; font-size: 28px; color: #075985; font-weight: bold;">${stats.totalOpportunities}</p>
            </div>
            <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Top Opportunities</h2>
            <table style="width: 100%; border-collapse: collapse;">${opportunityRows}</table>
            <div style="margin-top: 24px; padding: 16px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
              <a href="${clientUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">View All Opportunities</a>
            </div>
          </div>
        </div>
      </body></html>
    `;
  }

  private static generateWeeklySummaryText(
    opportunities: OpportunityEmailData[],
    stats: { totalOpportunities: number; totalValue: string; topAgencies: string[] }
  ): string {
    let text = `WEEKLY OPPORTUNITY SUMMARY\n`;
    text += `Week of ${new Date().toLocaleDateString()}\n\n`;
    text += `Total Opportunities: ${stats.totalOpportunities}\n\n`;
    text += `TOP OPPORTUNITIES:\n\n`;

    opportunities.slice(0, 10).forEach((opp, idx) => {
      text += `${idx + 1}. ${opp.title}\n`;
      text += `   Agency: ${opp.agency}\n`;
      text += `   Due: ${new Date(opp.dueDate).toLocaleDateString()}\n\n`;
    });

    return text;
  }

  private static generateSavedSearchAlertHTML(searchName: string, opportunities: OpportunityEmailData[]): string {
    const opportunityRows = opportunities.map(opp => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #111827;">
            <a href="${opp.link}" style="color: #2563eb; text-decoration: none;">${opp.title}</a>
          </h3>
          <p style="margin: 4px 0; font-size: 14px; color: #6b7280;">
            <strong>${opp.agency}</strong> • Due: ${new Date(opp.dueDate).toLocaleDateString()}
          </p>
        </td>
      </tr>
    `).join('');

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    return `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #dc2626; padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">🔔 Saved Search Alert</h1>
            <p style="margin: 8px 0 0 0; color: #fecaca; font-size: 16px; font-weight: 500;">${searchName}</p>
          </div>
          <div style="padding: 24px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
              We found <strong>${opportunities.length} new opportunities</strong> matching your saved search "${searchName}".
            </p>
            <table style="width: 100%; border-collapse: collapse;">${opportunityRows}</table>
            <div style="margin-top: 24px; padding: 16px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
              <a href="${clientUrl}/saved-searches" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">Run This Search Now</a>
            </div>
          </div>
        </div>
      </body></html>
    `;
  }

  private static generateSavedSearchAlertText(searchName: string, opportunities: OpportunityEmailData[]): string {
    let text = `SAVED SEARCH ALERT: ${searchName}\n\n`;
    text += `We found ${opportunities.length} new opportunities matching your saved search.\n\n`;

    opportunities.forEach((opp, idx) => {
      text += `${idx + 1}. ${opp.title}\n`;
      text += `   Agency: ${opp.agency}\n`;
      text += `   Due: ${new Date(opp.dueDate).toLocaleDateString()}\n\n`;
    });

    return text;
  }

  /**
   * Test email configuration
   */
  static async testConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.log('⚠️  Email service not configured');
        return false;
      }
      await transporter.verify();
      console.log('✅ Email service ready');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
}
