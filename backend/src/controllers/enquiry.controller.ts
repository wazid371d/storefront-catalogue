import type { RequestHandler } from 'express';
import type { EnquiryService } from '../services/enquiry.service';
import type { SubmitEnquiryInput } from '../validation/enquiry.schema';

export class EnquiryController {
  constructor(private readonly enquiries: EnquiryService) {}

  submit: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.enquiries.submit(req.body as SubmitEnquiryInput);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };
}
