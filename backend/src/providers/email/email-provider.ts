export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

export type SendEmailResult = { ok: true } | { ok: false; reason: string };

/**
 * Everything above this line (EnquiryService) depends only on this shape.
 * SmtpProvider (Nodemailer, pointed at MailHog locally / SES in prod) is the
 * one implementation today.
 */
export interface EmailProvider {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
