import type { EnquiryDocument } from '../models/enquiry.model';
import { EnquiryRepository } from '../repositories/enquiry.repository';
import type { ProductService } from './product.service';
import type { EmailProvider } from '../providers/email/email-provider';
import type { SubmitEnquiryInput } from '../validation/enquiry.schema';
import { logger } from '../utils/logger';

const RETRY_DELAY_MS = 2000;

export interface SubmitEnquiryResult {
  id: string;
  status: EnquiryDocument['status'];
}

function buildEmailBody(enquiry: EnquiryDocument): string {
  return [
    `Product: ${enquiry.productTitle} (id: ${enquiry.productId})`,
    `From: ${enquiry.name} <${enquiry.email}>`,
    enquiry.phone ? `Phone: ${enquiry.phone}` : null,
    '',
    enquiry.message,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

/**
 * Validates the product reference, persists the enquiry, and responds —
 * all before email delivery is even attempted. See SYSTEM_DESIGN.md §04/§08:
 * the "thank you" response must never wait on an email provider.
 */
export class EnquiryService {
  constructor(
    private readonly enquiries: EnquiryRepository,
    private readonly products: ProductService,
    private readonly email: EmailProvider,
    private readonly salesInboxEmail: string,
    /** overridable so tests don't have to wait out the real retry delay */
    private readonly retryDelayMs: number = RETRY_DELAY_MS,
  ) {}

  async submit(input: SubmitEnquiryInput): Promise<SubmitEnquiryResult> {
    const product = await this.products.getById(input.productId);

    const enquiry = await this.enquiries.create({
      productId: product.id,
      productTitle: product.title,
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
    });

    // Fire-and-forget: notifySalesTeam runs after this function has already
    // returned a result to the controller. A slow or down email provider
    // must never delay the customer's "thank you".
    void this.notifySalesTeam(enquiry).catch((err) => {
      logger.error('Enquiry email notification crashed', { error: String(err), enquiryId: String(enquiry._id) });
    });

    return { id: String(enquiry._id), status: enquiry.status };
  }

  private async notifySalesTeam(enquiry: EnquiryDocument): Promise<void> {
    const subject = `New enquiry — ${enquiry.productTitle}`;
    const text = buildEmailBody(enquiry);

    let result = await this.email.send({ to: this.salesInboxEmail, subject, text });

    if (!result.ok) {
      await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs));
      result = await this.email.send({ to: this.salesInboxEmail, subject, text });
    }

    await this.enquiries.updateStatus(String(enquiry._id), result.ok ? 'email_sent' : 'email_failed');

    if (!result.ok) {
      logger.warn('Enquiry email failed after retry — left as email_failed for manual follow-up', {
        enquiryId: String(enquiry._id),
      });
    }
  }
}
