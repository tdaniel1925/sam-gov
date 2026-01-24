// =============================================================================
// EMAIL SERVICE
// Following CodeBakers pattern 06b-email.md
// =============================================================================

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { Opportunity } from '../types/samgov';

export class EmailService {
  private static transporter: Transporter | null = null;

  /**
   * Get or create email transporter (lazy initialization)
   */
  private static getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
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
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `New Contracting Opportunities for NAICS ${naicsCode}`,
        text,
        html,
      });

      console.log(`Notification sent to ${email} for NAICS ${naicsCode}`);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
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
   * Test email configuration
   */
  static async testConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      console.log('Email service ready');
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }
}
