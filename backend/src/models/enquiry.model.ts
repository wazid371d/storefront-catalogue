import { Schema, model, Document } from 'mongoose';

export type EnquiryStatus = 'received' | 'email_sent' | 'email_failed';

export interface EnquiryDocument extends Document {
  productId: string;
  /** snapshot at submission time — survives the product later changing or disappearing */
  productTitle: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: EnquiryStatus;
  emailAttempts: number;
  createdAt: Date;
}

const enquirySchema = new Schema<EnquiryDocument>({
  productId: { type: String, required: true },
  productTitle: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['received', 'email_sent', 'email_failed'],
    required: true,
    default: 'received',
  },
  emailAttempts: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, required: true, default: Date.now },
});

enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ status: 1 });

export const EnquiryModel = model<EnquiryDocument>('Enquiry', enquirySchema);
