import rateLimit from 'express-rate-limit';

export function createEnquiryRateLimiter(windowMs: number, max: number) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many enquiries from this device — please try again shortly.' },
  });
}
