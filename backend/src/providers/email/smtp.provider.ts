import nodemailer, { Transporter } from 'nodemailer';
import type { EmailProvider, SendEmailInput, SendEmailResult } from './email-provider';
import { logger } from '../../utils/logger';

export class SmtpProvider implements EmailProvider {
  private readonly transporter: Transporter;

  constructor(
    private readonly options: { host: string; port: number; from: string },
  ) {
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: false,
    });
  }

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    try {
      await this.transporter.sendMail({
        from: this.options.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
      return { ok: true };
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'unknown error';
      logger.error('Email send failed', { reason });
      return { ok: false, reason };
    }
  }
}
