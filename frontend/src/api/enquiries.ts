import { apiClient } from './client';

export interface SubmitEnquiryInput {
  productId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface SubmitEnquiryResult {
  id: string;
  status: string;
}

export function submitEnquiry(input: SubmitEnquiryInput): Promise<SubmitEnquiryResult> {
  return apiClient.post('/enquiries', input);
}
