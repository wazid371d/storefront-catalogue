import { z } from 'zod';

export const submitEnquirySchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Please Enter a valid email address'),
  phone: z.string().trim().max(32, 'Phone number is too long').optional(),
  message: z
    .string()
    .trim()
    .min(10, 'Tell us a little more — at least 10 characters')
    .max(2000, 'Message is too long'),
});

export type SubmitEnquiryInput = z.infer<typeof submitEnquirySchema>;
