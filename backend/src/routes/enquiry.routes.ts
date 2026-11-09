import { Router } from 'express';
import type { EnquiryController } from '../controllers/enquiry.controller';
import { validateBody } from '../middleware/validate';
import { submitEnquirySchema } from '../validation/enquiry.schema';
import { createEnquiryRateLimiter } from '../middleware/rate-limit';

export function enquiryRoutes(controller: EnquiryController, rateLimit: { windowMs: number; max: number }): Router {
  const router = Router();

  router.post(
    '/',
    createEnquiryRateLimiter(rateLimit.windowMs, rateLimit.max),
    validateBody(submitEnquirySchema),
    controller.submit,
  );

  return router;
}
