import { Resend } from 'resend';
import { ConfirmEmailTemplate } from '../emails/ConfirmEmailTemplate';
import { ResetPasswordTemplate } from '../emails/ResetPasswordTemplate';
const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendConfirmationEmail(email: string, username: string, token: string) {
    const confirmLink = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;

    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Confirm your email address',
      react: ConfirmEmailTemplate({
        confirmLink,
        username,
      }),
    });
  },

  async sendPasswordResetEmail(email: string, username: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Reset your password',
      react: ResetPasswordTemplate({
        resetLink,
        username,
      }),
    });
  },
};
