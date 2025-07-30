import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendTeamRegistrationConfirmation(
    email: string,
    data: {
      teamName: string;
      registrationId: string;
    }
  ) {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_USER'),
      to: email,
      subject: 'Team Registration Confirmation - Tournament 2024',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Team Registration Confirmation</h2>
          <p>Dear Team Manager,</p>
          <p>Thank you for registering your team <strong>${data.teamName}</strong> for Tournament 2024!</p>
          <p><strong>Registration ID:</strong> ${data.registrationId}</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #495057;">Next Steps:</h3>
            <ol>
              <li>Complete your team's player roster</li>
              <li>Complete the registration payment</li>
              <li>Wait for admin approval</li>
            </ol>
          </div>
          <p>You will receive another email once your payment is processed and your team is approved.</p>
          <p>Best regards,<br>Tournament 2024 Team</p>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendPaymentConfirmation(
    email: string,
    data: {
      teamName: string;
      amount: number;
      currency: string;
      transactionId: string;
    }
  ) {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_USER'),
      to: email,
      subject: 'Payment Confirmation - Tournament 2024',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">Payment Successful!</h2>
          <p>Dear Team Manager,</p>
          <p>We have successfully received your payment for <strong>${data.teamName}</strong>.</p>
          <div style="background-color: #d4f6d4; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #155724;">Payment Details:</h3>
            <p><strong>Amount:</strong> ${data.currency.toUpperCase()} ${data.amount.toLocaleString()}</p>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p><strong>Team:</strong> ${data.teamName}</p>
          </div>
          <p>Your team registration is now complete and pending admin approval. You will be notified once your team is approved and ready to participate in the tournament.</p>
          <p>Best regards,<br>Tournament 2024 Team</p>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendTeamApprovalNotification(
    email: string,
    data: {
      teamName: string;
      approved: boolean;
      reason?: string;
    }
  ) {
    const subject = data.approved 
      ? 'Team Approved - Tournament 2024' 
      : 'Team Registration Update - Tournament 2024';

    const mailOptions = {
      from: this.configService.get<string>('SMTP_USER'),
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${data.approved ? '#27ae60' : '#e74c3c'};">
            ${data.approved ? 'Congratulations!' : 'Registration Update'}
          </h2>
          <p>Dear Team Manager,</p>
          ${data.approved 
            ? `<p>Great news! Your team <strong>${data.teamName}</strong> has been approved for Tournament 2024.</p>
               <div style="background-color: #d4f6d4; padding: 20px; border-radius: 5px; margin: 20px 0;">
                 <p>Your team is now officially registered and will appear on the tournament website. Match schedules will be announced soon.</p>
               </div>`
            : `<p>We regret to inform you that your team <strong>${data.teamName}</strong> registration requires attention.</p>
               <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0;">
                 <p><strong>Reason:</strong> ${data.reason || 'Please contact admin for more details.'}</p>
               </div>`
          }
          <p>For any questions, please contact our support team.</p>
          <p>Best regards,<br>Tournament 2024 Team</p>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }
}  