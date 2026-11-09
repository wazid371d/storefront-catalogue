import { EnquiryModel, EnquiryDocument, EnquiryStatus } from '../models/enquiry.model';

export interface CreateEnquiryInput {
  productId: string;
  productTitle: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export class EnquiryRepository {
  async create(input: CreateEnquiryInput): Promise<EnquiryDocument> {
    // write concern majority: don't ack the caller until the write is durable
    // on a majority of replica set members — losing a lead is not acceptable.
    const [doc] = await EnquiryModel.create([{ ...input, status: 'received', emailAttempts: 0 }], {
      w: 'majority',
    });
    return doc!; // always exactly one element — we passed a single-item array
  }

  async updateStatus(id: string, status: EnquiryStatus): Promise<void> {
    await EnquiryModel.findByIdAndUpdate(id, {
      $set: { status },
      $inc: { emailAttempts: 1 },
    });
  }
}
