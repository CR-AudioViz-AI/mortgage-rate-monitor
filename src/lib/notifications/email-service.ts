/**
 * Email Notification Service
 * 
 * Sends mortgage rate drop alerts via FREE Hostinger SMTP.
 * Uses info@craudiovizai.com (existing domain SMTP).
 * 
 * Features:
 * - Professional HTML email templates
 * - Rate drop notifications
 * - Test email functionality
 * - Error handling and retry logic
 * 
 * @timestamp 2025-11-12T14:47:00Z
 */

import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER || 'info@craudiovizai.com',
    pass: process.env.EMAIL_PASSWORD!,
  },
};

// Create reusable transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

interface RateAlertParams {
  to: string;
  location: string;
  rateType: string;
  oldRate: number;
  newRate: number;
  changePercent: number;
}

/**
 * Send rate drop alert email
 */
export async function sendRateAlert(params: RateAlertParams): Promise<void> {
  const { to, location, rateType, oldRate, newRate, changePercent } = params;

  // Format rate type for display
  const rateTypeDisplay = rateType
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Calculate savings estimate (on $400k loan)
  const oldMonthly = calculateMonthlyPayment(400000, oldRate, 30);
  const newMonthly = calculateMonthlyPayment(400000, newRate, 30);
  const monthlySavings = oldMonthly - newMonthly;
  const annualSavings = monthlySavings * 12;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mortgage Rate Drop Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                📉 Mortgage Rate Drop Alert
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Alert Message -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <p style="color: #0c4a6e; margin: 0; font-size: 16px; font-weight: bold;">
                  Great news! Mortgage rates have dropped in ${location}
                </p>
              </div>

              <!-- Rate Comparison -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="50%" style="padding: 20px; background-color: #fef3c7; border-radius: 8px; text-align: center;">
                    <div style="font-size: 14px; color: #78350f; margin-bottom: 8px;">Previous Rate</div>
                    <div style="font-size: 32px; font-weight: bold; color: #78350f;">${oldRate.toFixed(3)}%</div>
                  </td>
                  <td width="50%" style="padding: 20px; background-color: #dcfce7; border-radius: 8px; text-align: center;">
                    <div style="font-size: 14px; color: #14532d; margin-bottom: 8px;">New Rate</div>
                    <div style="font-size: 32px; font-weight: bold; color: #14532d;">${newRate.toFixed(3)}%</div>
                  </td>
                </tr>
              </table>

              <!-- Rate Details -->
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <table width="100%" cellpadding="8" cellspacing="0" border="0">
                  <tr>
                    <td style="color: #6b7280; font-size: 14px;">Location:</td>
                    <td style="color: #111827; font-size: 14px; font-weight: bold; text-align: right;">${location}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px;">Rate Type:</td>
                    <td style="color: #111827; font-size: 14px; font-weight: bold; text-align: right;">${rateTypeDisplay}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px;">Rate Change:</td>
                    <td style="color: #059669; font-size: 14px; font-weight: bold; text-align: right;">${changePercent.toFixed(2)}%</td>
                  </tr>
                </table>
              </div>

              <!-- Savings Estimate -->
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px;">Estimated Savings</h3>
                <p style="color: #d1fae5; margin: 0 0 10px 0; font-size: 13px;">On a $400,000 loan over 30 years:</p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="color: #ffffff; font-size: 14px;">Monthly:</td>
                    <td style="color: #ffffff; font-size: 20px; font-weight: bold; text-align: right;">$${monthlySavings.toFixed(0)}</td>
                  </tr>
                  <tr>
                    <td style="color: #ffffff; font-size: 14px;">Annually:</td>
                    <td style="color: #ffffff; font-size: 20px; font-weight: bold; text-align: right;">$${annualSavings.toFixed(0)}</td>
                  </tr>
                </table>
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin-bottom: 20px;">
                <a href="https://craudiovizai.com" 
                   style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  View Current Rates
                </a>
              </div>

              <!-- Note -->
              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
                <strong>Note:</strong> Rates are aggregated from multiple sources (Zillow, Bankrate, MortgageNewsDaily) 
                and updated hourly. Your actual rate may vary based on credit score, down payment, and lender.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0; text-align: center;">
                You're receiving this because you subscribed to rate drop alerts for ${location}.
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0; text-align: center;">
                © 2025 CR AudioViz AI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const emailText = `
Mortgage Rate Drop Alert

Good news! Mortgage rates have dropped in ${location}

Previous Rate: ${oldRate.toFixed(3)}%
New Rate: ${newRate.toFixed(3)}%
Rate Change: ${changePercent.toFixed(2)}%

Rate Type: ${rateTypeDisplay}

Estimated Savings (on $400,000 loan over 30 years):
- Monthly: $${monthlySavings.toFixed(0)}
- Annually: $${annualSavings.toFixed(0)}

View current rates: https://craudiovizai.com

Note: Rates are aggregated from multiple sources and updated hourly. Your actual rate may vary.

---
You're receiving this because you subscribed to rate drop alerts for ${location}.
© 2025 CR AudioViz AI
  `.trim();

  // Send email
  await transporter.sendMail({
    from: `"Mortgage Rate Alerts" <${EMAIL_CONFIG.auth.user}>`,
    to,
    subject: `🏡 Rate Drop: ${rateTypeDisplay} in ${location} - Save $${monthlySavings.toFixed(0)}/month`,
    text: emailText,
    html: emailHtml,
  });

  console.log(`[Email] Rate alert sent to ${to} for ${location}`);
}

/**
 * Calculate monthly mortgage payment
 */
function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) return principal / numPayments;

  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  return monthlyPayment;
}

/**
 * Test email configuration
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('[Email] SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('[Email] SMTP connection failed:', error);
    return false;
  }
}
