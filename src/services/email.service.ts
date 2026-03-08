import nodemailer from "nodemailer";
import { config } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export class EmailService {
  async sendVerificationEmail(to: string, token: string) {
    const url = `${config.frontendUrl}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: "Verify your email – GoldenView",
      html: `
        <p>Welcome to GoldenView! Please verify your email address by clicking the link below.</p>
        <p><a href="${url}">Verify my email</a></p>
        <p>The link expires in 24 hours.</p>
        <p>If you did not create an account, you can safely ignore this email.</p>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const url = `${config.frontendUrl}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: "Reset your password – GoldenView",
      html: `
        <p>You requested a password reset for your GoldenView account.</p>
        <p><a href="${url}">Reset my password</a></p>
        <p>The link expires in 1 hour.</p>
        <p>If you did not request a reset, you can safely ignore this email.</p>
      `,
    });
  }
}

export const emailService = new EmailService();
